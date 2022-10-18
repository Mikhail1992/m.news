import { Request, Response, NextFunction, Router } from 'express';

interface ICommentController {
  router: Router;
  create: (req: Request, res: Response, next: NextFunction) => void;
  findPublishedCommentsByArticleId: (req: Request, res: Response, next: NextFunction) => void;
  findDraftComments: (req: Request, res: Response, next: NextFunction) => void;
  publishComment: (req: Request, res: Response, next: NextFunction) => void;
  delete: (req: Request, res: Response, next: NextFunction) => void;
}

export { ICommentController };
