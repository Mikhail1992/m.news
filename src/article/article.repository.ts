import { Article, Category, Prisma, Role } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { ITokenPayload } from '../auth/auth.service';

import { TYPES } from '../constants/constants';
import { DatabaseService } from '../database/database.service';
import { IArticleRepository } from './article.repository.interface';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleUpdateDto } from './dto/article-update.dto';

@injectable()
class ArticleRepository implements IArticleRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async findArticleById(id: number, include: Prisma.ArticleInclude | null): Promise<Article> {
    return await this.databaseService.client.article.findUniqueOrThrow({
      include,
      where: { id },
    });
  }

  async findArticleByUrl(url: string, include: Prisma.ArticleInclude | null): Promise<Article> {
    return await this.databaseService.client.article.findUniqueOrThrow({
      include,
      where: { url },
    });
  }

  async create(data: ArticleCreateDto, userId: number): Promise<Article> {
    return await this.databaseService.client.article.create({
      data: { ...data, userId },
      include: { category: true },
    });
  }

  async update(data: ArticleUpdateDto, id: number): Promise<Article> {
    return await this.databaseService.client.article.update({ where: { id }, data });
  }

  async publish(id: number, published: boolean): Promise<Article> {
    return await this.databaseService.client.article.update({ where: { id }, data: { published } });
  }

  async findArticlesByCategoryUrl(offset: number, limit: number, url: string): Promise<Article[]> {
    const query = { where: { published: true, category: { url } } };

    return await this.databaseService.client.article.findMany({
      include: {
        category: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        id: 'desc',
      },
      ...query,
    });
  }

  async count(published: boolean, url?: string): Promise<number> {
    const query = {
      where: {
        published,
        category: {
          url,
        },
      },
    };

    return await this.databaseService.client.article.count(query);
  }

  async updateIncrement(id: number): Promise<Article> {
    return await this.databaseService.client.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async delete(id: number): Promise<Article> {
    return await this.databaseService.client.article.delete({ where: { id } });
  }

  async findMany(
    offset: number,
    limit: number,
    orderBy: Prisma.ArticleAvgOrderByAggregateInput,
    published: boolean,
  ): Promise<Article[]> {
    const query = { where: { published } };

    return await this.databaseService.client.article.findMany({
      include: {
        category: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy,
      ...query,
    });
  }

  createQuery(user: ITokenPayload) {
    const query: { where: { published: boolean; userId?: number } } =
      user?.role === Role.ADMIN
        ? { where: { published: false } }
        : { where: { published: false, userId: user.id } };

    return query;
  }

  async findManyDraftArticles(
    offset: number,
    limit: number,
    user: ITokenPayload,
  ): Promise<Article[]> {
    return await this.databaseService.client.article.findMany({
      include: { category: true },
      skip: offset,
      take: limit,
      orderBy: {
        id: 'desc',
      },
      ...this.createQuery(user),
    });
  }

  async countDraftArticles(published: boolean, user: ITokenPayload): Promise<number> {
    const query = this.createQuery(user);
    return await this.databaseService.client.article.count(query);
  }
}

export { ArticleRepository };
