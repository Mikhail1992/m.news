import { Response, Router } from 'express';
import { injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import 'reflect-metadata';

import { IController } from './controller.interface';
import { ILogger } from '../logger/logger.interface';

@injectable()
abstract class BaseController {
  private readonly _router: Router;

  constructor(private logger: ILogger) {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  public send<T>(res: Response, code: number, message?: T): Response {
    if (message) {
      res.type('application/json');
      return res.status(code).json(message);
    }
    return res.status(code).send();
  }

  public ok<T>(res: Response, message?: T): Response {
    return this.send<T>(res, StatusCodes.OK, message);
  }

  public created(res: Response): Response {
    return res.sendStatus(StatusCodes.CREATED);
  }

  protected bindRoutes(routes: Array<IController>): void {
    routes.forEach(({ path, func, method, middlewares }) => {
      this.logger.log(`[${method}] ${path}`);
      const middleware = middlewares?.map((m) => m.execute.bind(m));
      const handler = func.bind(this);
      const pipeline = middleware ? [...middleware, handler] : handler;
      this._router[method](path, pipeline);
    });
  }
}

export { BaseController };
