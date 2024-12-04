export interface MessagePayload {
  transactionId: string;
  messageId: number;
}

export interface CouponPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
	couponsCount: number;
}

export interface GenerateCouponsRequest {
  transactionId: string;
  payload: CouponPayload;
}

export interface IssueCouponsRequest {
  transactionId: string;
  payload: {
    targetProductId: number;
    userId: number;
  };
}
