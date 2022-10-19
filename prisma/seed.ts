import { PrismaClient, Prisma, Role } from '@prisma/client';

import { IAuthService } from '../src/auth/auth.service.interface';
import { TYPES } from '../src/constants/constants';
import { app, appContainer } from '../src/main';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Admin',
    email: 'admin@admin.com',
    password: '11111111',
    role: Role.ADMIN,
    articles: {
      create: [
        {
          published: true,
          title: 'Title 3',
          url: '3',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'people',
            },
          },
        },
        {
          published: false,
          title: 'Title 4',
          url: '4',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'places',
            },
          },
        },
        {
          published: false,
          title: 'Title 5',
          url: '5',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'events',
            },
          },
        },
      ],
    },
  },
  {
    name: 'Manager',
    email: 'manager@manager.com',
    password: '11111111',
    role: Role.MANAGER,
    articles: {
      create: [
        {
          published: true,
          title: 'Title 1',
          url: '1',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'events',
            },
          },
        },
        {
          published: true,
          title: 'Title 2',
          url: '2',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'places',
            },
          },
        },
        {
          published: false,
          title: 'Title 6',
          url: '6',
          spoiler: 'Short description',
          content: 'Long description',
          coverImage: '',
          picture: '',
          category: {
            connect: {
              title: 'people',
            },
          },
        },
      ],
    },
  },
  {
    name: 'User',
    email: 'user2@user.com',
    password: '11111111',
    role: Role.USER,
  },
];

const categoryData: Prisma.CategoryCreateInput[] = [
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

async function main() {
  console.log(`Start seeding ...`);

  for (const c of categoryData) {
    try {
      const category = await prisma.category.create({
        data: c,
      });
      console.log(`Created category with id: ${category.id}`);
    } catch (e) {
      console.log(`Category is already exists`);
    }
  }

  for (const u of userData) {
    try {
      const hashedPassword = await appContainer
        .get<IAuthService>(TYPES.IAuthService)
        .generatePassword(u.password);
      const user = await prisma.user.create({
        data: { ...u, password: hashedPassword },
      });
      console.log(`Created user with id: ${user.id}`);
    } catch (e) {
      console.log(`User is already exists`);
    }
  }

  app.close();
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
