import { Role, User } from '@prisma/client';
import { ITokenPayload } from '../auth/auth.service';
import { IPagination } from '../types';
import { UserCreateDto } from './dto/user-create.dto';
import UserDTO from './dto/user.dto';

interface IUserService {
  findByEmail: (email: string) => Promise<User>;
  findById: (id: number) => Promise<User>;
  findUsers: (limit: number, offset: number, user: ITokenPayload) => Promise<IPagination<UserDTO>>;
  updateUser: (id: number, role: Role) => Promise<User>;
  findMe: (userPayload: ITokenPayload) => Promise<UserDTO>;
  updatePassword: (userId: number, password: string) => Promise<User>;
  create: (userData: UserCreateDto) => Promise<User>;
}

export { IUserService };
