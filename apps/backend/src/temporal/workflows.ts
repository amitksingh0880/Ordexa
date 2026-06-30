// Temporal workflow for the order/inventory saga. Runs in Temporal's
// deterministic sandbox, so it may only import activity *types* — never the
// implementations or anything that touches I/O directly.
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { ORDER_WORKFLOW, OrderStatus } from "../constants/orders";

const {
  reserveInventoryActivity,
  processPaymentActivity,
  confirmReservationActivity,
  releaseReservationActivity,
  markOrderStatusActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: ORDER_WORKFLOW.activityStartToCloseTimeout,
  retry: { maximumAttempts: ORDER_WORKFLOW.activityMaxAttempts },
});

export interface OrderWorkflowInput {
  orderId: string;
  userId: string;
  sku: string;
  quantity: number;
  totalAmount: number;
}

/**
 * Durable order saga: reserve inventory → take payment → confirm the
 * reservation. On any failure, compensate by releasing the hold and marking
 * the order Failed. Temporal persists every step, so a worker/server restart
 * resumes exactly where it left off.
 */
export async function orderWorkflow(input: OrderWorkflowInput): Promise<string> {
  const { orderId, sku, quantity, totalAmount } = input;

  try {
    await reserveInventoryActivity({ orderId, sku, quantity });
    await processPaymentActivity({ orderId, totalAmount });
    await confirmReservationActivity(orderId);
    await markOrderStatusActivity(orderId, OrderStatus.Confirmed);
    return OrderStatus.Confirmed;
  } catch (err) {
    await releaseReservationActivity(orderId);
    await markOrderStatusActivity(orderId, OrderStatus.Failed);
    throw err;
  }
}
