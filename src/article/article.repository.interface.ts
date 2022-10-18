import { Article, Prisma } from '@prisma/client';
import { ITokenPayload } from '../auth/auth.service';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleUpdateDto } from './dto/article-update.dto';

interface IArticleRepository {
  findArticleById: (id: number, include: Prisma.ArticleInclude | null) => Promise<Article>;
  findArticleByUrl: (url: string, include: Prisma.ArticleInclude | null) => Promise<Article>;
  create: (data: ArticleCreateDto, userId: number) => Promise<Article>;
  update: (data: ArticleUpdateDto, id: number) => Promise<Article>;
  publish: (id: number, published: boolean) => Promise<Article>;
  findArticlesByCategoryUrl: (offset: number, limit: number, url: string) => Promise<Article[]>;
  count: (published: boolean, url?: string, user?: ITokenPayload) => Promise<number>;
  updateIncrement: (id: number) => Promise<Article>;
  delete: (id: number) => Promise<Article>;
  findMany: (
    offset: number,
    limit: number,
    orderBy: Prisma.ArticleAvgOrderByAggregateInput,
    published: boolean,
  ) => Promise<Article[]>;
  findManyDraftArticles: (offset: number, limit: number, user: ITokenPayload) => Promise<Article[]>;
  countDraftArticles: (published: boolean, user: ITokenPayload) => Promise<number>;
}

export { IArticleRepository };
