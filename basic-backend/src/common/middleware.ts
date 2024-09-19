import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';

export function transactionIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.header['transactionId'] = v4();
  next();
}
