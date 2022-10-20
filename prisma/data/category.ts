import { Prisma } from '@prisma/client';

export const categoryData: Prisma.CategoryCreateInput[] = [
  {
    title: 'people',
    url: 'people',
  },
  {
    title: 'events',
    url: 'events',
  },
  {
    title: 'places',
    url: 'places',
  },
];
