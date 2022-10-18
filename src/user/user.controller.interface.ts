import { Request, Response, NextFunction, Router } from 'express';

interface IUserController {
  router: Router;
  findUsers: (req: Request, res: Response, next: NextFunction) => void;
  update: (req: Request, res: Response, next: NextFunction) => void;
  findMe: (req: Request, res: Response, next: NextFunction) => void;
}

export { IUserController };
