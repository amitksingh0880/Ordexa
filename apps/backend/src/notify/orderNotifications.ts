import { sendEmail } from "./mailer";
import { orderStatusEmail, type OrderEmailData } from "./templates";
import { OrderStatus } from "../constants/orders";

const NOTIFY_STATUSES: string[] = [OrderStatus.Shipped, OrderStatus.Delivered];

export const notifyOrderStatus = async (updated: unknown): Promise<void> => {
  const order = updated as (OrderEmailData & { customerEmail?: string | null }) | null;
  if (order?.customerEmail && NOTIFY_STATUSES.includes(order.status)) {
    await sendEmail(orderStatusEmail(order));
  }
};
