import { Module } from '@nestjs/common';

import { CouponController } from './controller';
import { CounponService } from './service';

@Module({
  imports: [],
  controllers: [CouponController],
  providers: [CounponService],
  exports: [CounponService],
})
export class CouponModule{}
