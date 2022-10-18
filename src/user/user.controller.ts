import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import 'reflect-metadata';

import { BaseController } from '../common/controller/base.controller';
import { TYPES } from '../constants/constants';
import { ILogger } from '../common/logger/logger.interface';
import { IUserService } from './user.service.interface';
import { IUserController } from './user.controller.interface';
import { ValidateMiddleware } from '../common/validate.middleware';
import { UserUpdateDto } from './dto/user-update.dto';
import { getParcedLimit } from '../utils/pagination';
import { GuardMiddleware } from '../common/guard.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, USER]
 *       example:
 *         id: 1
 *         name: John
 *         email: admin@admin.com
 *         role: ADMIN
 */

@injectable()
class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.IUserService) private userService: IUserService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/',
        method: 'get',
        func: this.findUsers,
        middlewares: [new GuardMiddleware([Role.ADMIN])],
      },
      {
        path: '/:id',
        method: 'patch',
        func: this.update,
        middlewares: [new GuardMiddleware([Role.ADMIN]), new ValidateMiddleware(UserUpdateDto)],
      },
      {
        path: '/me',
        method: 'get',
        func: this.findMe,
        middlewares: [new GuardMiddleware()],
      },
    ]);
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users [ADMIN]
   *     tags: [Users]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Pagination limit
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integert
   *         description: Pagination offset
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               $ref: '#/components/schemas/User'
   */
  async findUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 10, 100);
      const offset = Number(req.query.offset) || 0;
      const user = req.user;

      const result = await this.userService.findUsers(limit, offset, user);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   patch:
   *     summary: Update one user [ADMIN]
   *     tags: [Users]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         description: User id
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                role:
   *                  type: string
   *                  enum: [ADMIN, MANAGER, USER]
   *     responses:
   *       204:
   *         description: Success
   *       404:
   *         description: User with this email does not exist
   */

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { role } = req.body;

      await this.userService.updateUser(id, role);

      this.send(res, StatusCodes.NO_CONTENT);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /users/me:
   *   get:
   *     summary: Get personal data
   *     tags: [Users]
   *     security:
   *       - AccessToken: []
   *     responses:
   *       200:
   *         description: Personal user data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */

  async findMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      const result = await this.userService.findMe(user);

      this.ok(res, { user: result });
    } catch (err) {
      return next(err);
    }
  }
}

export { UserController };
