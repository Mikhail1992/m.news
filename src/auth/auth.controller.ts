import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import Exception from '../common/Exception';
import UserDTO from '../user/dto/user.dto';
import * as service from './auth.service';
import { BaseController } from '../common/controller/base.controller';
import { IAuthController } from './auth.controller.interface';
import { ILogger } from '../common/logger/logger.interface';
import { IAuthService } from './auth.service.interface';
import { TYPES } from '../constants/constants';
import { ValidateMiddleware } from '../common/validate.middleware';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { IUserService } from '../user/user.service.interface';
import { IMailerService } from '../mailer/mailer.service.interface';
import { IConfigService } from '../config/config.service.interface';
import { GuardMiddleware } from '../common/guard.middleware';

@injectable()
class AuthController extends BaseController implements IAuthController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.IAuthService) private authService: IAuthService,
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.IMailerService) private mailerService: IMailerService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/token',
        method: 'get',
        func: this.getToken,
      },
      {
        path: '/login',
        method: 'post',
        func: this.login,
        middlewares: [new ValidateMiddleware(UserLoginDto)],
      },
      {
        path: '/register',
        method: 'post',
        func: this.register,
        middlewares: [new ValidateMiddleware(UserRegisterDto)],
      },
      {
        path: '/forgot-password',
        method: 'post',
        func: this.forgotPassword,
        middlewares: [new ValidateMiddleware(ForgotPasswordDto)],
      },
      {
        path: '/restore-password',
        method: 'post',
        func: this.restorePassword,
        middlewares: [new GuardMiddleware(), new ValidateMiddleware(RestorePasswordDto)],
      },
      {
        path: '/logout',
        method: 'get',
        func: this.logout,
        middlewares: [new GuardMiddleware()],
      },
    ]);
  }

  /**
   * @swagger
   * /auth/token:
   *   get:
   *     summary: Returns new access token by refresh token
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Access token generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *       403:
   *         description: Access denied
   */

  async getToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return next(new Exception(StatusCodes.FORBIDDEN, 'Access denied'));
      }

      const decodedUser = jwt.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      ) as service.ITokenPayload;

      const user = await this.userService.findByEmail(decodedUser.email);

      const { token: accessToken } = this.authService.getCookieWithJwtAccessToken(user);
      const { cookie: refreshTokenCookie } = this.authService.getCookieWithJwtRefreshToken(user);

      res.setHeader('Set-Cookie', [refreshTokenCookie]);

      this.ok(res, { accessToken });
    } catch (err) {
      return next(err);
    }
  }
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                email:
   *                  type: string
   *                password:
   *                  type: script
   *              required:
   *                - email
   *                - password
   *     responses:
   *       200:
   *         description: Successful user login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User is not exist
   *       400:
   *         description: Invalid Credentials
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await this.authService.findAuthenticatedUser(email, password);

      const { token: accessToken } = this.authService.getCookieWithJwtAccessToken(user);
      const { cookie: refreshTokenCookie } = this.authService.getCookieWithJwtRefreshToken(user);

      res.setHeader('Set-Cookie', [refreshTokenCookie]);

      this.ok(res, { user: new UserDTO(user), accessToken });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *             required:
   *               - email
   *               - password
   *     responses:
   *       201:
   *         description: Successful redistration
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       409:
   *         description: User already exists
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      await this.authService.userRegister(email, password);

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Forgot user password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *             required:
   *               - email
   *     responses:
   *       200:
   *         description: Email sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 url:
   *                   type: string
   *       404:
   *         description: User not found
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const user = await this.userService.findByEmail(email);

      const { token: accessToken } = this.authService.getCookieWithJwtAccessToken(user);

      const url = `${this.configService.get('CLIENT_URL')}/restore-password?token=${accessToken}`;

      this.mailerService.sentRestorePasswordLinkToEmail(email, url);

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /auth/restore-password:
   *   post:
   *     summary: Restore user password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               password1:
   *                 type: string
   *               password2:
   *                 type: string
   *             required:
   *               - password1
   *               - password2
   *     responses:
   *       204:
   *         description: Password successfully updated
   *       404:
   *         description: User not found
   */
  async restorePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password1 } = req.body;
      const userPayload = req.user;
      const { email } = userPayload;

      const user = await this.userService.findByEmail(email);

      const hashedPasswors = await this.authService.generatePassword(password1);

      await this.userService.updatePassword(user.id, hashedPasswors);

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   get:
   *     summary: Logout
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: User successfully signed out
   */

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken');

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }
}

export { AuthController };
