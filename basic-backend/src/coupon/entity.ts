export interface Coupon {
	uid: number;
	name: string;
	targetProductId: number;
	discountRate: number;
	createdAt: Date;
	validUntil: Date;
}
