import { prisma } from "../lib/prisma";
import { config } from "../config/env";
import { OrderStatus, ORDER_WORKFLOW } from "../constants/orders";
import {
  reserveInventory,
  confirmReservation,
  releaseReservation,
} from "../services/inventory.service";
import { getTemporalClient, isTemporalEnabled } from "../temporal/client";

export interface OrderOrchestrationInput {
  orderId: string;
  userId: string;
  sku: string;
  quantity: number;
  totalAmount: number;
}

/**
 * Entry point for driving an order's inventory saga.
 *
 * - Temporal enabled (TEMPORAL_ADDRESS set): start the durable workflow and
 *   return immediately; the worker advances it and updates order status.
 * - Otherwise (Render free tier): run the same steps in-process via the Saga
 *   orchestrator. Synchronous; throws on terminal failure (e.g. out of stock).
 */
export async function runOrderOrchestration(input: OrderOrchestrationInput): Promise<void> {
  if (isTemporalEnabled()) {
    await startTemporalWorkflow(input);
    return;
  }
  await runInProcessSaga(input);
}

async function startTemporalWorkflow(input: OrderOrchestrationInput): Promise<void> {
  const client = await getTemporalClient();
  await client.workflow.start(ORDER_WORKFLOW.type, {
    args: [input],
    taskQueue: config.temporal.taskQueue,
    workflowId: `${ORDER_WORKFLOW.idPrefix}${input.orderId}`,
  });
}

async function runInProcessSaga(input: OrderOrchestrationInput): Promise<void> {
  const { orderId, sku, quantity, totalAmount } = input;

  // Step 1 — reserve. Done outside the try/compensate block so typed failures
  // (InsufficientInventoryError / UnknownSkuError) propagate to the handler,
  // which maps them to 409/400. Nothing is held if this throws (it's atomic).
  await reserveInventory({ orderId, sku, quantity });

  // Steps 2–3 — payment then confirm. On any failure here we compensate by
  // releasing the hold and marking the order Failed.
  try {
    if (totalAmount <= 0) throw new Error("Invalid payment amount"); // simulated payment
    await confirmReservation(orderId);
    await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.Confirmed } });
  } catch (err) {
    await releaseReservation(orderId);
    await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.Failed } });
    throw err;
  }
}
