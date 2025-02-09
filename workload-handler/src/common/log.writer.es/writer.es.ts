import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { OnEvent } from "@nestjs/event-emitter";

export const EVENT_NAME_LOGGING = 'transaction';

const INDEX_NAME = 'barnacle-log';
const ACTOR = 'workload-handler';

export interface TransactionLoggingEventPayload {
  transactionId: string;
  data: object;
}

@Injectable()
export class EventLogWriterES {
  constructor(private readonly esService: ElasticsearchService) {}

  @OnEvent(EVENT_NAME_LOGGING)
  async transactionEventHandler(payload: TransactionLoggingEventPayload): Promise<void> {
    Logger.log(`EventWriteMongo.transactionEventHandler] ${JSON.stringify(payload)}`);

    const result = await this.esService.index({
      index: INDEX_NAME,
      document: {
        'esCreatedAt': new Date(),
        'actor': ACTOR.toString(),
        'transactionId': payload.transactionId,
        'data': payload.data,
      },
    });

    Logger.log(`EventLogWriterES.transactionEventHandler] document created: ${result._id}`);
  }
}
