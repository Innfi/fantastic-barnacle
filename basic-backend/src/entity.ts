
export interface Coupon {
	uid: number;
	name: string;
	targetProductId: number;
	discountRate: number;
	createdAt: Date;
	validUntil: Date;
}

export interface EnqueMessagePayload {
  messageId: number;
}

export interface EnqueMessageResponse {
  result: string;
  receivedMessageId: number;
}
