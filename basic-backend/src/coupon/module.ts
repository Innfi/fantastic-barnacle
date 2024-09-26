import { Module } from '@nestjs/common';

import { CouponController } from './controller';
import { CounponService } from './service';

@Module({
  imports: [],
  providers: [CouponController, CounponService],
})
export class CouponModule{}

