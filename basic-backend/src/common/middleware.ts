import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';


@Injectable()
export class TransactionIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.header['transactionId'] = v4();

    next();
  }
}
