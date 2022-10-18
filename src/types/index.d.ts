import { ITokenPayload } from '../auth/auth.service';

export {};

declare global {
  namespace Express {
    interface Request {
      user: ITokenPayload;
    }
  }
}

export interface IPagination<T> {
  limit: number;
  offset: number;
  count: number;
  data: T[];
}
