import { Request, Response, NextFunction, Router } from 'express';

interface ICategoryController {
  router: Router;
  create: (req: Request, res: Response, next: NextFunction) => void;
  findAll: (req: Request, res: Response, next: NextFunction) => void;
}

export { ICategoryController };
