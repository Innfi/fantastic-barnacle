import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Request  } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EVENT_LOG_HTTP, HttpLogPayload } from './log.payload';

@Injectable()
export class LoggingInterceptor implements NestInterceptor { 
  constructor(
    private eventEmitter: EventEmitter2,
  ) {
    Logger.log('LoggingInterceptor()');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();

    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();

    return next
      .handle()
      .pipe(
        tap((response: object) => {
          this.eventEmitter.emit(EVENT_LOG_HTTP, { 
            request: {
              transactionId: request.header['transactionId'],
              path: request.path,
              query: request.query,
              params: request.params,
              body: request.body,
            }, 
            response 
          } as HttpLogPayload);
        }),
      );
  }
}
