import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import 'reflect-metadata';

import { BaseController } from '../common/controller/base.controller';
import { TYPES } from '../constants/constants';
import { ValidateMiddleware } from '../common/validate.middleware';
import { IArticleController } from './article.controller.interface';
import { ILogger } from '../common/logger/logger.interface';
import { IArticleService } from './article.service.interface';
import { getParcedLimit } from '../utils/pagination';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleUpdateDto } from './dto/article-update.dto';
import { ArticlePublishDto } from './dto/article-publish.dto';
import { GuardMiddleware } from '../common/guard.middleware';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AccessToken:
 *       type: apiKey
 *       in: header
 *       name: x-access-token
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - url
 *         - content
 *         - userId
 *         - categoryId
 *       properties:
 *         id:
 *           type: number
 *         published:
 *           type: boolean
 *         title:
 *           type: string
 *         url:
 *           type: string
 *         spoiler:
 *           type: string
 *         coverImage:
 *           type: string
 *         picture:
 *           type: string
 *         content:
 *           type: string
 *         views:
 *           type: string
 *         user:
 *           type: object
 *           item:
 *             $ref: '#/components/schemas/User'
 *         userId:
 *           type: number
 *         category:
 *           type: object
 *           item:
 *             $ref: '#/components/schemas/Category'
 *         categoryId:
 *           type: string
 *       example:
 *         id: 1
 *         published: true
 *         title: people
 *         url: people
 *         spoiler: ''
 *         coverImage: '/'
 *         picture: '/'
 *         content: ''
 *         views: 2
 *         userId: 1
 *         categoryId: 1
 */

@injectable()
class ArticleController extends BaseController implements IArticleController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.IArticleService) private articleService: IArticleService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/',
        method: 'get',
        func: this.findAll,
      },
      {
        path: '/',
        method: 'post',
        func: this.create,
        middlewares: [
          new GuardMiddleware([Role.ADMIN, Role.MANAGER]),
          new ValidateMiddleware(ArticleCreateDto),
        ],
      },
      {
        path: '/draft',
        method: 'get',
        func: this.findAllDraft,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: '/popular',
        method: 'get',
        func: this.findPopular,
      },
      {
        path: '/:url',
        method: 'get',
        func: this.findByUrl,
      },
      {
        path: '/:url/private',
        method: 'get',
        func: this.findByPrivateUrl,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: '/:id',
        method: 'patch',
        func: this.update,
        middlewares: [
          new GuardMiddleware([Role.ADMIN, Role.MANAGER]),
          new ValidateMiddleware(ArticleUpdateDto),
        ],
      },
      {
        path: '/:id',
        method: 'delete',
        func: this.delete,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: '/:id/publish',
        method: 'post',
        func: this.publish,
        middlewares: [new GuardMiddleware([Role.ADMIN]), new ValidateMiddleware(ArticlePublishDto)],
      },
      {
        path: '/category/:url',
        method: 'get',
        func: this.findByCategotyUrl,
      },
    ]);
  }

  /**
   * @swagger
   * /articles:
   *   get:
   *     summary: Get list of articles
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Pagination limit
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *         description: Pagination offset
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 limit:
   *                   type: number
   *                 offset:
   *                   type: number
   *                 count:
   *                   type: number
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Article'
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 10, 10);
      const offset = Number(req.query.offset) || 0;

      const result = await this.articleService.findArticles(limit, offset);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles:
   *   post:
   *     summary: Create article [ADMIN, MANAGER]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                url:
   *                  type: string
   *                spoiler:
   *                  type: string
   *                coverImage:
   *                  type: string
   *                picture:
   *                  type: string
   *                content:
   *                  type: string
   *                userId:
   *                  type: number
   *                categoryId:
   *                  type: string
   *              required:
   *                - title
   *                - url
   *                - content
   *                - userId
   *                - categoryId
   *     responses:
   *       201:
   *         description: Article created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Article'
   */

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;

      const result = this.articleService.create(req.body, Number(user.id));

      this.send(res, StatusCodes.CREATED, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/draft:
   *   get:
   *     summary: Get draft articles [ADMIN, MANAGER]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Pagination limit
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *         description: Pagination offset
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 limit:
   *                   type: number
   *                 offset:
   *                   type: number
   *                 count:
   *                   type: number
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Article'
   */

  async findAllDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 5, 10);
      const offset = Number(req.query.offset) || 0;
      const user = req.user;

      const result = await this.articleService.findDraftArticles(limit, offset, user);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/popular:
   *   get:
   *     summary: Get list of popular articles
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Pagination limit
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *         description: Pagination offset
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 limit:
   *                   type: number
   *                 offset:
   *                   type: number
   *                 count:
   *                   type: number
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Article'
   */

  async findPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 4, 10);
      const offset = Number(req.query.offset) || 0;

      const result = await this.articleService.findPopularArticles(limit, offset);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/{url}:
   *   get:
   *     summary: Get one article
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: url
   *         schema:
   *           type: string
   *         description: Article url
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Article'
   *       404:
   *         description: Article not found
   */
  async findByUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.params;

      const result = await this.articleService.findByUrl(url);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/{url}/private:
   *   get:
   *     summary: Get one article [ADMIN, MANAGER]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: url
   *         schema:
   *           type: string
   *         description: Article url
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Article'
   *       404:
   *         description: Article not found
   */

  async findByPrivateUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.params;
      const user = req.user;

      const result = await this.articleService.findPrivateByUrl(url, user);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/{id}:
   *   patch:
   *     summary: Get one article [ADMIN, MANAGER]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         description: Article id
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                url:
   *                  type: string
   *                spoiler:
   *                  type: string
   *                coverImage:
   *                  type: string
   *                picture:
   *                  type: string
   *                content:
   *                  type: string
   *                categoryId:
   *                  type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Article'
   *       403:
   *         description: Access denied
   *       404:
   *         description: Article not found
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const user = req.user;

      const result = await this.articleService.update(req.body, user, id);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/{id}:
   *   delete:
   *     summary: Delete one article [ADMIN, MANAGER]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         description: Article id
   *     responses:
   *       200:
   *         description: Success
   *       403:
   *         description: Access denied
   *       404:
   *         description: Article not found
   */

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const user = req.user;

      await this.articleService.deleteArticleById(id, user);

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/{id}/publish:
   *   post:
   *     summary: Publish one article [ADMIN]
   *     tags: [Articles]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         description: Article id
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                published:
   *                  type: boolean
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Article'
   *       404:
   *         description: Article not found
   */

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { published } = req.body;

      const result = await this.articleService.publish(id, published);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /articles/category/{url}:
   *   get:
   *     summary: Get list of articles by category url
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: url
   *         schema:
   *           type: string
   *         description: Pagination limit
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Pagination limit
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *         description: Pagination offset
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 limit:
   *                   type: number
   *                 offset:
   *                   type: number
   *                 count:
   *                   type: number
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Article'
   */
  async findByCategotyUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 5, 10);
      const offset = Number(req.query.offset) || 0;
      const { url } = req.params;

      const result = await this.articleService.findArticlesByCategoryUrl(limit, offset, url);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export { ArticleController };
