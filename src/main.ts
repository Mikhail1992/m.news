import { Container, ContainerModule, interfaces } from 'inversify';

import { App } from './app';
import { ArticleController } from './article/article.controller';
import { IArticleController } from './article/article.controller.interface';
import { ArticleService } from './article/article.service';
import { IArticleService } from './article/article.service.interface';
import { AuthController } from './auth/auth.controller';
import { IAuthController } from './auth/auth.controller.interface';
import { AuthService } from './auth/auth.service';
import { IAuthService } from './auth/auth.service.interface';
import { CategoryController } from './category/category.controller';
import { ICategoryController } from './category/category.controller.interface';
import { CategoryService } from './category/category.service';
import { ICategoryService } from './category/category.service.interface';
import { CategoryRepository } from './category/category.repository';
import { ICategoryRepository } from './category/category.repository.interface';
import { CommentController } from './comment/comment.controller';
import { ICommentController } from './comment/comment.controller.interface';
import { CommentService } from './comment/comment.service';
import { ICommentService } from './comment/comment.service.interface';
import { ICommentRepository } from './comment/comment.repository.interface';
import { CommentRepository } from './comment/comment.repository';
import { ExceptionFilter } from './common/exception.filter';
import { IExceptionFilter } from './common/exception.filter.interface';
import { ILogger } from './common/logger/logger.interface';
import { LoggerService } from './common/logger/logger.service';
import { TYPES } from './constants/constants';
import { DatabaseService } from './database/database.service';
import { ImageController } from './image/image.controller';
import { IImageController } from './image/image.controller.interface';
import { ImageService } from './image/image.service';
import { IImageService } from './image/image.service.interface';
import { MailerService } from './mailer/mailer.service';
import { IMailerService } from './mailer/mailer.service.interface';
import { UserController } from './user/user.controller';
import { IUserController } from './user/user.controller.interface';
import { UserService } from './user/user.service';
import { IUserService } from './user/user.service.interface';
import { ArticleRepository } from './article/article.repository';
import { IArticleRepository } from './article/article.repository.interface';
import { IUserRepository } from './user/user.repository.interface';
import { UserRepository } from './user/user.repository';
import { ConfigService } from './config/config.service';
import { UploadClient } from './common/upload-client';
import { IConfigService } from './config/config.service.interface';
import { IUploadClient } from './common/upload-client.interface';
import { SeedService } from './seed/seed.service';

interface IBootstrap {
  appContainer: Container;
  app: App;
}

export const appBinging = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
  bind<ICategoryController>(TYPES.ICategoryController).to(CategoryController).inSingletonScope();
  bind<ICategoryService>(TYPES.ICategoryService).to(CategoryService).inSingletonScope();
  bind<ICategoryRepository>(TYPES.ICategoryRepository).to(CategoryRepository).inSingletonScope();
  bind<IArticleController>(TYPES.IArticleController).to(ArticleController).inSingletonScope();
  bind<IArticleService>(TYPES.IArticleService).to(ArticleService).inSingletonScope();
  bind<IArticleRepository>(TYPES.IArticleRepository).to(ArticleRepository).inSingletonScope();
  bind<IImageController>(TYPES.IImageController).to(ImageController).inSingletonScope();
  bind<IImageService>(TYPES.IImageService).to(ImageService).inSingletonScope();
  bind<ICommentController>(TYPES.ICommentController).to(CommentController).inSingletonScope();
  bind<ICommentService>(TYPES.ICommentService).to(CommentService).inSingletonScope();
  bind<ICommentRepository>(TYPES.ICommentRepository).to(CommentRepository).inSingletonScope();
  bind<IUserController>(TYPES.IUserController).to(UserController).inSingletonScope();
  bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();
  bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
  bind<IAuthController>(TYPES.IAuthController).to(AuthController).inSingletonScope();
  bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
  bind<IMailerService>(TYPES.IMailerService).to(MailerService).inSingletonScope();
  bind<IExceptionFilter>(TYPES.IExceptionFilter).to(ExceptionFilter).inSingletonScope();
  bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
  bind<IConfigService>(TYPES.IConfigService).to(ConfigService).inSingletonScope();
  bind<IUploadClient>(TYPES.IUploadClient).to(UploadClient).inSingletonScope();
  bind<SeedService>(TYPES.SeedService).to(SeedService).inSingletonScope();
  bind<App>(TYPES.Application).to(App);
});

const bootstrap = (): IBootstrap => {
  const appContainer = new Container();
  appContainer.load(appBinging);
  const app = appContainer.get<App>(TYPES.Application);
  app.init();

  return { appContainer, app };
};

export const { app, appContainer } = bootstrap();
