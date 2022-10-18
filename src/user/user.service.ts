import { Role, User } from '@prisma/client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { ITokenPayload } from '../auth/auth.service';
import { TYPES } from '../constants/constants';
import { IPagination } from '../types';
import { UserCreateDto } from './dto/user-create.dto';
import UserDTO from './dto/user.dto';
import { IUserRepository } from './user.repository.interface';
import { IUserService } from './user.service.interface';

@injectable()
class UserService implements IUserService {
  constructor(@inject(TYPES.IUserRepository) private userRepository: IUserRepository) {}

  findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findById(id);
  }

  async findUsers(
    limit: number,
    offset: number,
    user: ITokenPayload,
  ): Promise<IPagination<UserDTO>> {
    const users = await this.userRepository.findMany(user.id);

    const count = await this.userRepository.count(user.id);

    return {
      data: users.map((user: User) => new UserDTO(user)),
      limit,
      offset,
      count,
    };
  }

  updateUser(id: number, role: Role): Promise<User> {
    return this.userRepository.update(id, role);
  }

  async findMe(userPayload: ITokenPayload): Promise<UserDTO> {
    const user = await this.findByEmail(userPayload.email);

    return new UserDTO(user);
  }

  async updatePassword(userId: number, password: string): Promise<User> {
    return await this.userRepository.updatePassword(userId, password);
  }

  async create(userData: UserCreateDto): Promise<User> {
    return await this.userRepository.create(userData);
  }
}

export { UserService };
