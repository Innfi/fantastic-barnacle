import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { CouponController } from './controller';
import { CounponService } from './service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'request_queue' }),
    BullModule.registerQueue({ name: 'response_queue' }),
  ],
  controllers: [CouponController],
  providers: [CounponService],
  exports: [CounponService],
})
export class CouponModule{}
