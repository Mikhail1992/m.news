import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { IExceptionFilter } from './exception.filter.interface';
import { TYPES } from '../constants/constants';
import { ILogger } from './logger/logger.interface';
import Exception from './Exception';

@injectable()
class ExceptionFilter implements IExceptionFilter {
  constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {}

  catch(err: Error | Exception, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof Exception) {
      this.loggerService.error(`[${err.code}]: ${err.message}`);
      res.status(err.code).json({
        message: err.message,
      });
    } else {
      this.loggerService.error(`[${StatusCodes.INTERNAL_SERVER_ERROR}]: ${err.message}`);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message || 'Server Error',
      });
    }
  }
}

export { ExceptionFilter };
