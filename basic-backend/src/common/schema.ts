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

  @Prop({ type: Object })
  request: {
    path: string;
    query: object;
    params: object;
    body: object;
  };

  @Prop({ type: Object })
  response: object;
}

export type BarnacleLogDocument = HydratedDocument<BarnacleLog>;

export const BarnacleLogSchema = SchemaFactory.createForClass(BarnacleLog);
