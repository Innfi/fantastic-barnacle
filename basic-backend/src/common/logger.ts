import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Model } from 'mongoose';

import { BarnacleLog } from './schema';

export const EVENT_NAME_LOGGING = 'transaction';

interface LogPayload {
  request: Request;
  response: Response;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(BarnacleLog.name) private logModel: Model<BarnacleLog>
  ) {
    Logger.log('LoggingInterceptor()');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();

    return next
      .handle()
      .pipe(
        tap((response: Response) => {
          this.eventEmitter.emit(EVENT_NAME_LOGGING, { request, response });
        }),
      );
  }

  @OnEvent(EVENT_NAME_LOGGING)
  async handleLoggingEvent(payload: Readonly<LogPayload>): Promise<void> {
    Logger.log(`handleLoggingEvent] ${payload.request.path}`);
  }
}
