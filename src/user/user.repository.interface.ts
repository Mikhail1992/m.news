import { Role, User } from '@prisma/client';
import { UserCreateDto } from './dto/user-create.dto';

interface IUserRepository {
  findByEmail: (email: string) => Promise<User>;
  findById: (id: number) => Promise<User>;
  findMany: (userId: number) => Promise<User[]>;
  count: (userId: number) => Promise<number>;
  update: (id: number, role: Role) => Promise<User>;
  updatePassword: (userId: number, password: string) => Promise<User>;
  create: (userData: UserCreateDto) => Promise<User>;
}

export { IUserRepository };
