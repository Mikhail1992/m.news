import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt, { Secret } from 'jsonwebtoken';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import Exception from '../common/Exception';
import { IAuthService } from './auth.service.interface';
import { TYPES } from '../constants/constants';
import { IUserService } from '../user/user.service.interface';
import { IConfigService } from '../config/config.service.interface';

export interface ITokenPayload {
  id: User['id'];
  role: User['role'];
  email: User['email'];
}

@injectable()
class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
  ) {}

  private makeTokenPayload({ id, role, email }: User): ITokenPayload {
    return {
      id,
      role,
      email,
    };
  }

  async generatePassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(Number(this.configService.get('SALT')));
    const hashedPasswors = await bcrypt.hash(password, salt);

    return hashedPasswors;
  }

  async findAuthenticatedUser(email: string, plainTextPassword: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    await this.verifyPassword(plainTextPassword, user.password);

    return user;
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new Exception(StatusCodes.INTERNAL_SERVER_ERROR, 'Wrong credentials provided');
    }
  }

  async userRegister(email: string, password: string): Promise<User> {
    const hashedPasswors = await this.generatePassword(password);

    const result = await this.userService.create({
      email,
      password: hashedPasswors,
    });

    return result;
  }

  getCookieWithJwtAccessToken(user: User): { token: string; cookie: string } {
    const payload = this.makeTokenPayload(user);
    const token = jwt.sign(payload, this.configService.get('JWT_ACCESS_TOKEN_SECRET') as Secret, {
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });

    const cookie = `accessToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;

    return { token, cookie };
  }

  getCookieWithJwtRefreshToken(user: User): { token: string; cookie: string } {
    const payload = this.makeTokenPayload(user);
    const token = jwt.sign(payload, this.configService.get('JWT_REFRESH_TOKEN_SECRET') as Secret, {
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });

    const cookie = `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;

    return { token, cookie };
  }
}

export { AuthService };
