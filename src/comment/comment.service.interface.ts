import { Comment } from '@prisma/client';
import { IPagination } from '../types';

interface ICommentService {
  createComment: (text: string, articleId: number, userId: number) => Promise<Comment>;
  findPublishedCommentsByArticleId: (
    limit: number,
    offset: number,
    articleId: number,
  ) => Promise<IPagination<Comment>>;
  findDraftComments: (limit: number, offset: number) => Promise<IPagination<Comment>>;
  publishCommentById: (id: number) => Promise<Comment>;
  deleteCommentById: (id: number) => Promise<Comment>;
}

export { ICommentService };
