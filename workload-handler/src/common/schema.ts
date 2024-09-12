import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class BarnacleLog {
  @Prop()
  transactionId: string;

  @Prop()
  messageId: number;

  @Prop()
  createdAt: Date;
}

export type BarnacleLogDocument = HydratedDocument<BarnacleLog>;

export const BarnacleLogSchema = SchemaFactory.createForClass(BarnacleLog);

