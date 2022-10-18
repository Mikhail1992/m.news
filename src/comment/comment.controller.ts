import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import 'reflect-metadata';

import { BaseController } from '../common/controller/base.controller';
import { TYPES } from '../constants/constants';
import { ICommentController } from './comment.controller.interface';
import { ILogger } from '../common/logger/logger.interface';
import { ICommentService } from './comment.service.interface';
import { ValidateMiddleware } from '../common/validate.middleware';
import { CommentCreateDto } from './dto/comment-create.dto';
import { getParcedLimit } from '../utils/pagination';
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
 *     Comment:
 *       type: object
 *       required:
 *         - text
 *         - articleId
 *       properties:
 *         id:
 *           type: number
 *         text:
 *           type: string
 *         published:
 *           type: boolean
 *         articleId:
 *           type: string
 *         userId:
 *           type: string
 *       example:
 *         id: 1
 *         text: people
 *         published: true
 *         articleId: 1
 *         userId: 1
 */

@injectable()
class CommentController extends BaseController implements ICommentController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.ICommentService) private commentService: ICommentService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/',
        method: 'post',
        func: this.create,
        middlewares: [new GuardMiddleware(), new ValidateMiddleware(CommentCreateDto)],
      },
      {
        path: '/article/:articleId',
        method: 'get',
        func: this.findPublishedCommentsByArticleId,
      },
      {
        path: '/draft',
        method: 'get',
        func: this.findDraftComments,
      },
      {
        path: '/:id/publish',
        method: 'post',
        func: this.publishComment,
      },
      {
        path: '/:id',
        method: 'delete',
        func: this.delete,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
    ]);
  }

  /**
   * @swagger
   * /comments:
   *   post:
   *     summary: Returns successful status
   *     tags: [Comments]
   *     security:
   *       - AccessToken: []
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                text:
   *                  type: string
   *                articleId:
   *                  type: string
   *              required:
   *                - title
   *                - articleId
   *     responses:
   *       201:
   *          description: The comment was successfully created
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, articleId } = req.body;
      const user = req.user;

      const result = await this.commentService.createComment(text, articleId, user.id);

      this.send(res, StatusCodes.CREATED, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /comments/article/{articleId}:
   *   get:
   *     summary: Returns comments
   *     tags: [Comments]
   *     parameters:
   *       - in: path
   *         name: articleId
   *         schema:
   *           type: string
   *         description: Article Id
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
   *                     $ref: '#/components/schemas/Comment'
   */
  async findPublishedCommentsByArticleId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 5, 10);
      const offset = Number(req.query.offset) || 0;
      const articleId = Number(req.params.articleId);

      const result = await this.commentService.findPublishedCommentsByArticleId(
        limit,
        offset,
        articleId,
      );

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /comments/draft:
   *   get:
   *     summary: Returns draft comments [ADMIN]
   *     tags: [Comments]
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
   *     security:
   *       - AccessToken: []
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
   *                     $ref: '#/components/schemas/Comment'
   */
  async findDraftComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = getParcedLimit(Number(req.query.limit), 5, 10);
      const offset = Number(req.query.offset) || 0;

      const result = await this.commentService.findDraftComments(limit, offset);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /comments/{id}/publish:
   *   post:
   *     summary: Returns draft comments [ADMIN, MANAGER]
   *     tags: [Comments]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         description: Comment id
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/Comment'
   */
  async publishComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      const result = await this.commentService.publishCommentById(id);

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /comments/{id}:
   *   delete:
   *     summary: Delete comment [ADMIN, MANAGER]
   *     tags: [Comments]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         description: Comment id
   *     responses:
   *       200:
   *         description: Success
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      await this.commentService.deleteCommentById(id);

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }
}

export { CommentController };
