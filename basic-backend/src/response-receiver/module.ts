import { Module } from '@nestjs/common';

import { QueueReceiver } from './receiver';

@Module({
  providers: [QueueReceiver],
})
export class ResponseReceiverModule{}
