import { Article, Prisma } from '@prisma/client';
import { ITokenPayload } from '../auth/auth.service';
import { IPagination } from '../types';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleUpdateDto } from './dto/article-update.dto';

interface IArticleService {
  findArticleById: (id: number, include: Prisma.ArticleInclude | null) => Promise<Article | Error>;
  findArticleByUrl: (
    url: string,
    include: Prisma.ArticleInclude | null,
  ) => Promise<Article | Error>;
  create: (data: ArticleCreateDto, userId: number) => Promise<Article>;
  update: (data: ArticleUpdateDto, user: ITokenPayload, id: number) => Promise<Article>;
  publish: (id: number, published: boolean) => Promise<Article>;
  findArticlesByCategoryUrl: (
    limit: number,
    offset: number,
    url: string,
  ) => Promise<IPagination<Article>>;
  incrementAmountOfViews: (id: number) => Promise<Article>;
  findByUrl: (url: string) => Promise<Article>;
  findPrivateByUrl: (url: string, user: ITokenPayload) => Promise<Article>;
  deleteArticleById: (id: number, user: ITokenPayload) => Promise<Article>;
  findListOfArticles: (
    limit: number,
    offset: number,
    orderBy: Prisma.ArticleAvgOrderByAggregateInput,
  ) => Promise<IPagination<Article>>;
  findPopularArticles: (limit: number, offset: number) => Promise<IPagination<Article>>;
  findArticles: (limit: number, offset: number) => Promise<IPagination<Article>>;
  findDraftArticles: (
    limit: number,
    offset: number,
    user: ITokenPayload,
  ) => Promise<IPagination<Article>>;
}

export { IArticleService };
