import { Category } from '@prisma/client';

interface ICategoryService {
  createCategory: (title: string, url: string) => Promise<Category>;
  findCategories: () => Promise<Category[]>;
  findCategoryByUrl: (url: string) => Promise<Category>;
}

export { ICategoryService };
