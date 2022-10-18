import { Category } from '@prisma/client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { ICategoryService } from './category.service.interface';
import { TYPES } from '../constants/constants';
import { ICategoryRepository } from './category.repository.interface';

@injectable()
class CategoryService implements ICategoryService {
  constructor(@inject(TYPES.ICategoryRepository) private categoryRepository: ICategoryRepository) {}

  createCategory(title: string, url: string): Promise<Category> {
    return this.categoryRepository.create(title, url);
  }

  findCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  findCategoryByUrl(url: string): Promise<Category> {
    return this.categoryRepository.findByUrl(url);
  }
}

export { CategoryService };
