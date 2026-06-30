import Razorpay from "razorpay";
import { config } from "../config/env";

export const razorpay = config.payments.razorpay.enabled
  ? new Razorpay({
      key_id: config.payments.razorpay.keyId,
      key_secret: config.payments.razorpay.keySecret,
    })
  : null;
