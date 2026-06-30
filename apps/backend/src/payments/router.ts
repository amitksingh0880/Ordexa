import { Router, type Request, type Response, type NextFunction } from "express";
import { config } from "../config/env";
import { requireAuth } from "../auth/middleware";
import { authorizeArn } from "../auth/authorize";
import { ARN_MODULES, ARN_ACTIONS } from "../constants/arn";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./schemas";
import {
  createPaymentOrder,
  verifyPayment,
  EmptyCartError,
  OrderNotFoundError,
  SignatureError,
} from "./service";

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const checkoutGuard = authorizeArn(ARN_MODULES.payments, ARN_ACTIONS.checkout);

export function createPaymentsRouter(): Router {
  const router = Router();

  router.get("/config", (_req, res) => {
    res.json({
      data: {
        razorpay: {
          enabled: config.payments.razorpay.enabled,
          keyId: config.payments.razorpay.enabled ? config.payments.razorpay.keyId : null,
        },
        shipping: {
          currency: config.shipping.currency,
          freeThreshold: config.shipping.freeThreshold,
          methods: config.shipping.methods,
        },
      },
    });
  });

  router.post(
    "/razorpay/order",
    requireAuth,
    checkoutGuard,
    asyncHandler(async (req, res) => {
      const parsed = createPaymentOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message });
      }
      try {
        const result = await createPaymentOrder(req.user!.id, parsed.data);
        res.status(201).json({ data: result });
      } catch (err) {
        if (err instanceof EmptyCartError) return res.status(400).json({ error: err.message });
        throw err;
      }
    }),
  );

  router.post(
    "/razorpay/verify",
    requireAuth,
    checkoutGuard,
    asyncHandler(async (req, res) => {
      const parsed = verifyPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message });
      }
      try {
        const order = await verifyPayment(req.user!.id, parsed.data);
        res.json({ data: { orderId: order.id, status: order.status, paymentStatus: order.paymentStatus } });
      } catch (err) {
        if (err instanceof OrderNotFoundError) return res.status(404).json({ error: err.message });
        if (err instanceof SignatureError) return res.status(400).json({ error: err.message });
        throw err;
      }
    }),
  );

  return router;
}
