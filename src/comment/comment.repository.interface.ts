import { Comment } from '@prisma/client';

interface ICommentRepository {
  create: (text: string, articleId: number, userId: number) => Promise<Comment>;
  findAll: (
    offset: number,
    limit: number,
    articleId: number,
    published: boolean,
  ) => Promise<Comment[]>;
  findMany: (offset: number, limit: number, published: boolean) => Promise<Comment[]>;
  count: (published: boolean, articleId?: number) => Promise<number>;
  publish: (id: number) => Promise<Comment>;
  delete: (id: number) => Promise<Comment>;
}

export { ICommentRepository };
