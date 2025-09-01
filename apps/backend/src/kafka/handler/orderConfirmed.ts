import { runInventorySaga } from "../../saga/inventorySaga";

export async function handleOrderConfirmed(event: any) {
  const { eventType, data } = event;

  if (eventType !== "OrderConfirmed") {
    throw new Error(`Invalid eventType: ${eventType}`);
  }

  const { orderId, userId, totalAmount } = data;

  console.log(`📥 Received OrderConfirmed for order ${orderId}`);
  await runInventorySaga({ orderId, userId, totalAmount });
}
