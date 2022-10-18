import { Request, Response, NextFunction, Router } from 'express';

interface IAuthController {
  router: Router;
  getToken: (req: Request, res: Response, next: NextFunction) => void;
  login: (req: Request, res: Response, next: NextFunction) => void;
  register: (req: Request, res: Response, next: NextFunction) => void;
  forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
  restorePassword: (req: Request, res: Response, next: NextFunction) => void;
  logout: (req: Request, res: Response, next: NextFunction) => void;
}

export { IAuthController };
