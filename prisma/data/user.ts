import { Prisma, Role } from "@prisma/client";

export const userData: Prisma.UserCreateInput[] = [
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