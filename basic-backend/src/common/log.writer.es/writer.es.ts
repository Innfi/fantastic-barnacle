import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ElasticsearchService } from "@nestjs/elasticsearch";

import { EVENT_LOG_HTTP, EVENT_WORKLOAD_HANDLER_RESP, HttpLogPayload } from "../log.payload";

const INDEX_NAME = 'barnacle-log';
const ACTOR = 'basic-backend';

@Injectable()
export class LogWriterES {
  constructor(private readonly esService: ElasticsearchService) {}

  @OnEvent(EVENT_LOG_HTTP)
  async handleLogginEventHttp(payload: Readonly<HttpLogPayload>): Promise<void>  {
    Logger.log(`LogWriterES.handleLogginEventHttp] ${payload.request.transactionId}`);
    const { request, response } = payload;

    const result = await this.esService.index({
      index: INDEX_NAME,
      document: {
        'esCreatedAt': new Date(),
        'actor': ACTOR.toString(),
        'transactionId': request.transactionId,
        'data': {
          'request': {
            'path': request.path,
            'query': request.query,
            'params': request.params,
            'body': request.body,
          },
          'response': response,
        },
      },
    });

    Logger.log(`LogWriterES.handleLogginEventHttp] document created: ${result._id}`);
  }

  @OnEvent(EVENT_WORKLOAD_HANDLER_RESP)
  async handleLoggingEventWorkload(payload: Readonly<object & { transactionId: string }>): Promise<void> {
    Logger.log(`LogWriterES.handleLoggingEventWorkload] ${payload.transactionId}`);

    const result = await this.esService.index({
      index: INDEX_NAME,
      document: {
        'esCreatedAt': new Date(),
        'actor': ACTOR.toString(),
        'transactionId': payload.transactionId,
        'data': {
          'query.resp': payload,
        },
      },
    });

    Logger.log(`LogWriterES.handleLoggingEventWorkload] document created: ${result._id}`);
  }
}