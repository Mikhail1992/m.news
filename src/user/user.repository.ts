import { Role, User } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/constants';
import { DatabaseService } from '../database/database.service';
import { UserCreateDto } from './dto/user-create.dto';
import { IUserRepository } from './user.repository.interface';

@injectable()
class UserRepository implements IUserRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async findByEmail(email: string): Promise<User> {
    return await this.databaseService.client.user.findUniqueOrThrow({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    return await this.databaseService.client.user.findUniqueOrThrow({ where: { id } });
  }

  async findMany(userId: number): Promise<User[]> {
    const query = { where: { id: { not: userId } } };

    return await this.databaseService.client.user.findMany(query);
  }

  async count(userId: number): Promise<number> {
    const query = { where: { id: { not: userId } } };

    return await this.databaseService.client.user.count(query);
  }

  async update(id: number, role: Role): Promise<User> {
    return await this.databaseService.client.user.update({ where: { id }, data: { role } });
  }

  async updatePassword(userId: number, password: string): Promise<User> {
    return await this.databaseService.client.user.update({
      where: { id: userId },
      data: { password },
    });
  }

  async create(userData: UserCreateDto): Promise<User> {
    return await this.databaseService.client.user.create({ data: userData });
  }
}

export { UserRepository };
