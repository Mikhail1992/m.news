import { Article, Prisma, Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { ITokenPayload } from '../auth/auth.service';
import Exception from '../common/Exception';
import { IPagination } from '../types';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleUpdateDto } from './dto/article-update.dto';
import { IArticleService } from './article.service.interface';
import { TYPES } from '../constants/constants';
import { ICategoryService } from '../category/category.service.interface';
import { IArticleRepository } from './article.repository.interface';

@injectable()
class ArticleService implements IArticleService {
  constructor(
    @inject(TYPES.ICategoryService) private categoryService: ICategoryService,
    @inject(TYPES.IArticleRepository) private articleRepository: IArticleRepository,
  ) {}

  findArticleById(id: number, include: Prisma.ArticleInclude | null = null): Promise<Article> {
    return this.articleRepository.findArticleById(id, include);
  }

  findArticleByUrl(url: string, include: Prisma.ArticleInclude | null = null): Promise<Article> {
    return this.articleRepository.findArticleByUrl(url, include);
  }

  create(data: ArticleCreateDto, userId: number): Promise<Article> {
    return this.articleRepository.create(data, userId);
  }

  async update(data: ArticleUpdateDto, user: ITokenPayload, id: number): Promise<Article> {
    const article = await this.findArticleById(id);

    if (user.id !== article.userId && user.role !== Role.ADMIN) {
      throw new Exception(StatusCodes.FORBIDDEN, 'Access denied');
    }

    const updatedArticle = await this.articleRepository.update(data, id);

    return updatedArticle;
  }

  async publish(id: number, published: boolean): Promise<Article> {
    return await this.articleRepository.publish(id, published);
  }

  async findArticlesByCategoryUrl(
    limit: number,
    offset: number,
    url: string,
  ): Promise<IPagination<Article>> {
    await this.categoryService.findCategoryByUrl(url);

    const data = await this.articleRepository.findArticlesByCategoryUrl(offset, limit, url);

    const count = await this.articleRepository.count(true, url);

    return {
      data,
      limit,
      offset,
      count,
    };
  }

  incrementAmountOfViews(id: number): Promise<Article> {
    return this.articleRepository.updateIncrement(id);
  }

  async findByUrl(url: string): Promise<Article> {
    const article = await this.findArticleByUrl(url, {
      category: true,
      _count: {
        select: {
          comments: true,
        },
      },
    });

    if (!article.published) {
      throw new Exception(StatusCodes.NOT_FOUND, 'Article not found');
    }

    await this.incrementAmountOfViews(article.id);

    return article;
  }

  async findPrivateByUrl(url: string, user: ITokenPayload): Promise<Article> {
    const article = await this.findArticleByUrl(url, {
      category: true,
      _count: {
        select: {
          comments: true,
        },
      },
    });

    if (user?.role !== Role.ADMIN && user?.role !== Role.MANAGER && article.userId !== user.id) {
      throw new Exception(StatusCodes.FORBIDDEN, 'Access denied');
    }

    return article;
  }

  async deleteArticleById(id: number, user: ITokenPayload): Promise<Article> {
    const article = await this.findArticleById(id);

    if (user.id !== article.userId && user.role !== Role.ADMIN) {
      throw new Exception(StatusCodes.FORBIDDEN, 'Access denied');
    }

    return await this.articleRepository.delete(id);
  }

  async findListOfArticles(
    limit: number,
    offset: number,
    orderBy: Prisma.ArticleAvgOrderByAggregateInput,
  ): Promise<IPagination<Article>> {
    const data = await this.articleRepository.findMany(offset, limit, orderBy, true);

    const count = await this.articleRepository.count(true);

    return {
      data,
      limit,
      offset,
      count,
    };
  }

  async findPopularArticles(limit: number, offset: number): Promise<IPagination<Article>> {
    return await this.findListOfArticles(limit, offset, { views: 'desc' });
  }

  async findArticles(limit: number, offset: number): Promise<IPagination<Article>> {
    return await this.findListOfArticles(limit, offset, { id: 'desc' });
  }

  async findDraftArticles(
    limit: number,
    offset: number,
    user: ITokenPayload,
  ): Promise<IPagination<Article>> {
    const data = await this.articleRepository.findManyDraftArticles(offset, limit, user);

    const count = await this.articleRepository.countDraftArticles(false, user);

    return {
      data,
      limit,
      offset,
      count,
    };
  }
}

export { ArticleService };
