import { Category } from '@prisma/client';

interface ICategoryRepository {
  create: (title: string, url: string) => Promise<Category>;
  findAll: () => Promise<Category[]>;
  findByUrl: (url: string) => Promise<Category>;
}

export { ICategoryRepository };
