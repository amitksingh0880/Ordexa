import { prisma } from "../lib/prisma";

export interface CouponResult {
  valid: boolean;
  discount: number;
  code?: string;
  message?: string;
}

const COUPON_TYPE = { percent: "percent", fixed: "fixed" } as const;

export const computeCouponDiscount = async (
  tenantId: string,
  code: string,
  subtotal: number,
): Promise<CouponResult> => {
  const coupon = await prisma.coupon.findFirst({
    where: { tenantId, code, active: true },
  });
  if (!coupon) return { valid: false, discount: 0, message: "Invalid code" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, discount: 0, message: "Code expired" };
  }
  if (subtotal < coupon.minSubtotal) {
    return { valid: false, discount: 0, message: "Order below minimum for this code" };
  }
  const raw =
    coupon.type === COUPON_TYPE.percent ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = Math.min(subtotal, Math.max(0, raw));
  return { valid: true, discount, code: coupon.code };
};
