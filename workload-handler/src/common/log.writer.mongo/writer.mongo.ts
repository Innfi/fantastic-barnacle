import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { BarnacleLog } from "./schema";

export const EVENT_NAME_LOGGING = 'transaction';

export interface TransactionLoggingEventPayload {
  messageId: number;
  transactionId: string;
  createdAt: Date;
}

@Injectable()
export class EventLogWriterMongo {
  constructor(@InjectModel(BarnacleLog.name) private logModel: Model<BarnacleLog>) {}

  @OnEvent(EVENT_NAME_LOGGING)
  async transactionEventHandler(payload: TransactionLoggingEventPayload): Promise<void> {
    Logger.log(`eventHandlerTransaction] transactionId: ${payload.transactionId}`);

    await this.saveLogToMongoDB(payload);
  }

  private async saveLogToMongoDB(payload: TransactionLoggingEventPayload): Promise<void> {
    try {
      const updateResult = await this.logModel.updateOne(
        { transactionId: { $eq: payload.transactionId } },
        { $set: { 
            'transactionId': payload.transactionId,
            'messageId': payload.messageId,
            'createdAt': payload.createdAt,
          } 
        },
        { upsert: true },
      );
      Logger.log(`saveLogToMongoDB] updateResult: ${JSON.stringify(updateResult)}`);
    } catch (err: unknown) {
      Logger.error(`saveLogToMongoDB] ${(err as Error).message}`);
    }
  }
}
