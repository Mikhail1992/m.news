import { Category } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { TYPES } from '../constants/constants';
import { DatabaseService } from '../database/database.service';
import { ICategoryRepository } from './category.repository.interface';

@injectable()
class CategoryRepository implements ICategoryRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async create(title: string, url: string): Promise<Category> {
    return await this.databaseService.client.category.create({ data: { title, url } });
  }

  async findAll(): Promise<Category[]> {
    return await this.databaseService.client.category.findMany();
  }

  async findByUrl(url: string): Promise<Category> {
    return await this.databaseService.client.category.findUniqueOrThrow({
      where: { url },
    });
  }
}

export { CategoryRepository };
