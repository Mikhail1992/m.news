const PORT = 8080;

const TYPES = {
  Application: Symbol.for('Application'),
  ILogger: Symbol.for('ILogger'),
  ICategoryService: Symbol.for('ICategoryService'),
  ICategoryController: Symbol.for('ICategoryController'),
  ICategoryRepository: Symbol.for('ICategoryRepository'),
  IArticleService: Symbol.for('IArticleService'),
  IArticleController: Symbol.for('IArticleController'),
  IArticleRepository: Symbol.for('IArticleRepository'),
  IImageService: Symbol.for('IImageService'),
  IImageController: Symbol.for('IImageController'),
  ICommentService: Symbol.for('ICommentService'),
  ICommentController: Symbol.for('ICommentController'),
  ICommentRepository: Symbol.for('ICommentRepository'),
  IAuthService: Symbol.for('IAuthService'),
  IAuthController: Symbol.for('IAuthController'),
  IUserService: Symbol.for('IUserService'),
  IUserController: Symbol.for('IUserController'),
  IUserRepository: Symbol.for('IUserRepository'),
  IMailerService: Symbol.for('IMailerService'),
  IExceptionFilter: Symbol.for('ExceptionFilter'),
  DatabaseService: Symbol.for('DatabaseService'),
  IConfigService: Symbol.for('ConfigService'),
  IUploadClient: Symbol.for('UploadClient'),
};

export { PORT, TYPES };
