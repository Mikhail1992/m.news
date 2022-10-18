import { User } from '@prisma/client';

interface IAuthService {
  generatePassword(password: string): Promise<string>;
  findAuthenticatedUser(email: string, plainTextPassword: string): Promise<User>;
  verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<void>;
  userRegister(email: string, password: string): Promise<User>;
  getCookieWithJwtAccessToken(user: User): { token: string; cookie: string };
  getCookieWithJwtRefreshToken(user: User): { token: string; cookie: string };
}

export { IAuthService };
