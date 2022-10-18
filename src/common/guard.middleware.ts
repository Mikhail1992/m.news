import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import Exception from './Exception';
import { IMiddleware } from './middleware.interface';

export class GuardMiddleware implements IMiddleware {
  constructor(private roles: User['role'][] = []) {}

  execute(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      return next(new Exception(StatusCodes.FORBIDDEN, 'User not authorized'));
    }

    if (this.roles.length && !this.roles.includes(req?.user?.role)) {
      return next(new Exception(StatusCodes.FORBIDDEN, 'No permissions'));
    }

    return next();
  }
}
