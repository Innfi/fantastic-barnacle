import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';

export function transactionIdMiddleware(req: Request, res: Response, next: NextFunction) {
  Logger.log('transactionMiddleware.use] ');

  req.header['transactionId'] = v4();

  next();
}
