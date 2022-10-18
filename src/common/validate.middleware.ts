import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { IMiddleware } from './middleware.interface';

export class ValidateMiddleware implements IMiddleware {
  constructor(private classToValidate: ClassConstructor<object>) {}

  execute({ body }: Request, res: Response, next: NextFunction): void {
    const instance = plainToClass(this.classToValidate, body);
    validate(instance).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(errors);
      } else {
        return next();
      }
    });
  }
}
