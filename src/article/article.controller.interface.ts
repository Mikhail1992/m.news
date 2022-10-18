import { Request, Response, NextFunction, Router } from 'express';

interface IArticleController {
  router: Router;
  findAll: (req: Request, res: Response, next: NextFunction) => void;
  findAllDraft: (req: Request, res: Response, next: NextFunction) => void;
  findPopular: (req: Request, res: Response, next: NextFunction) => void;
  findByUrl: (req: Request, res: Response, next: NextFunction) => void;
  findByPrivateUrl: (req: Request, res: Response, next: NextFunction) => void;
  findByCategotyUrl: (req: Request, res: Response, next: NextFunction) => void;
  create: (req: Request, res: Response, next: NextFunction) => void;
  update: (req: Request, res: Response, next: NextFunction) => void;
  delete: (req: Request, res: Response, next: NextFunction) => void;
  publish: (req: Request, res: Response, next: NextFunction) => void;
}

export { IArticleController };
