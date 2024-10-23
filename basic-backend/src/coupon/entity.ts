export interface Coupon {
	uuid: string;
	targetProductId: number;
	discountRate: number;
	createdAt: Date;
	validUntil: Date;
}

export class PostGenerateCouponsPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
	couponsCount: number;
}

export interface PostGenerateCouponsResponse {
  targetProductId: number;
  couponsCount: number;
	status: string;
}

export interface PostIssueCouponPayload {
	targetProductId: number;
	userId: number; //FIXME: implement authentication?
}
