import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { BarnacleLog } from "../common/schema";

export const EVENT_NAME_LOGGING = 'transaction';

export interface TransactionLoggingEventPayload {
  messageId: number;
  transactionId: string;
  createdAt: Date;
}

@Injectable()
export class EventLogger {
  constructor(@InjectModel(BarnacleLog.name) private logModel: Model<BarnacleLog>) {}

  @OnEvent(EVENT_NAME_LOGGING)
  async eventHandlerTransaction(payload: TransactionLoggingEventPayload): Promise<void> {
    Logger.log(`eventHandlerTransaction] transactionId: ${payload.transactionId}`);

    await this.saveLogToMongoDB(payload);
  }

  private async saveLogToMongoDB(payload: TransactionLoggingEventPayload): Promise<void> {
    try {
      const newDocument = new this.logModel(payload);

      const saveResult = await newDocument.save();

      Logger.log(`saveLogToMongoDB] new document id: ${saveResult.id}`);
    } catch (err: unknown) {
      Logger.error(`saveLogToMongoDB] ${(err as Error).message}`);
    }
  }
}
