import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import 'reflect-metadata';

import { BaseController } from '../common/controller/base.controller';
import { TYPES } from '../constants/constants';
import { ValidateMiddleware } from '../common/validate.middleware';
import { ICategoryController } from './category.controller.interface';
import { CategoryCreateDto } from './dto/category-create.dto';
import { ICategoryService } from './category.service.interface';
import { ILogger } from '../common/logger/logger.interface';
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
 *     Category:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: number
 *         title:
 *           type: string
 *       example:
 *         id: 1
 *         title: people
 */

@injectable()
class CategoryController extends BaseController implements ICategoryController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.ICategoryService) private categoryService: ICategoryService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/',
        method: 'post',
        func: this.create,
        middlewares: [
          new GuardMiddleware([Role.ADMIN, Role.MANAGER]),
          new ValidateMiddleware(CategoryCreateDto),
        ],
      },
      {
        path: '/',
        method: 'get',
        func: this.findAll,
      },
    ]);
  }

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Returns successfull status [ADMIN, MANAGER]
   *     tags: [Categories]
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
   *              required:
   *                - title
   *     responses:
   *       201:
   *          description: The category was successfully created
   */

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, url } = req.body;

      const result = await this.categoryService.createCategory(title, url);

      this.send(res, StatusCodes.CREATED, result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Returns the list of categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: The list of the categories
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               $ref: '#/components/schemas/Category'
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.categoryService.findCategories();

      this.ok(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export { CategoryController };
