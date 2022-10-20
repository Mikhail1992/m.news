import express, { Express } from 'express';
import { Server } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { PORT, TYPES } from './constants/constants';
import swaggerDocument from './swagger.json';
import { ILogger } from './common/logger/logger.interface';
import { IExceptionFilter } from './common/exception.filter.interface';
import { ICategoryController } from './category/category.controller.interface';
import { IArticleController } from './article/article.controller.interface';
import { IImageController } from './image/image.controller.interface';
import { ICommentController } from './comment/comment.controller.interface';
import { IAuthController } from './auth/auth.controller.interface';
import { IUserController } from './user/user.controller.interface';
import { DatabaseService } from './database/database.service';
import { SeedService } from './seed/seed.service';
import { AuthMiddleware } from './common/auth.middleware';
import { IConfigService } from './config/config.service.interface';

@injectable()
class App {
  app: Express;
  server: Server;
  port: number;

  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.ICategoryController) private categoryController: ICategoryController,
    @inject(TYPES.IArticleController) private articleController: IArticleController,
    @inject(TYPES.IImageController) private imageController: IImageController,
    @inject(TYPES.ICommentController) private commentController: ICommentController,
    @inject(TYPES.IAuthController) private authController: IAuthController,
    @inject(TYPES.IUserController) private userController: IUserController,
    @inject(TYPES.IExceptionFilter) private exceptionFilter: IExceptionFilter,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.SeedService) private seedService: SeedService,
  ) {
    this.app = express();
    this.port = PORT;
  }

  useMiddleware(): void {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(cors());
    const auth = new AuthMiddleware(this.configService.get('JWT_ACCESS_TOKEN_SECRET'));
    this.app.use(auth.execute.bind(auth));
  }

  useRoutes(): void {
    this.app.use('/articles', this.articleController.router);
    this.app.use('/auth', this.authController.router);
    this.app.use('/categories', this.categoryController.router);
    this.app.use('/comments', this.commentController.router);
    this.app.use('/images', this.imageController.router);
    this.app.use('/users', this.userController.router);
    this.app.get('/health', (req, res) => res.status(StatusCodes.NO_CONTENT).send());
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerDocument)));
  }

  useExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.app.use('*', (req, res) =>
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Page not found' }),
    );
  }

  public async init(): Promise<void> {
    this.useMiddleware();
    this.useRoutes();
    this.useExceptionFilters();
    await this.databaseService.connect();
    await this.seedService.fill();
    this.server = this.app.listen(this.port);
    this.loggerService.log(`Server works http://localhost:${this.port}`);
  }

  public close(): void {
    this.server.close();
  }
}

export { App };
