import { Request, Response, NextFunction, Router } from 'express';

interface IImageController {
  router: Router;
  upload: (req: Request, res: Response, next: NextFunction) => void;
  deleteImages: (req: Request, res: Response, next: NextFunction) => void;
}

export { IImageController };
