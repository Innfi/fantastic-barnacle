export interface Coupon {
	uid: number;
	name: string;
	targetProductId: number;
	discountRate: number;
	createdAt: Date;
	validUntil: Date;
}

export class PostGenerateCouponsPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
}

export interface PostGenerateCouponsResponse {
  targetProductId: number;
  couponsCount: number;
}