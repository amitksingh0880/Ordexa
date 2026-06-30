// Temporal activities. These are plain async functions registered with the
// worker AND reused by the in-process orchestrator, so the inventory logic has
// a single source of truth regardless of which path drives an order.
import { prisma } from "../lib/prisma";
import {
  reserveInventory,
  confirmReservation,
  releaseReservation,
} from "../services/inventory.service";

export interface OrderWorkflowInput {
  orderId: string;
  userId: string;
  sku: string;
  quantity: number;
  totalAmount: number;
}

export async function reserveInventoryActivity(input: {
  orderId: string;
  sku: string;
  quantity: number;
}): Promise<void> {
  await reserveInventory(input);
}

export async function processPaymentActivity(input: {
  orderId: string;
  totalAmount: number;
}): Promise<void> {
  // Simulated payment. Swap in a real PSP (Stripe, etc.) here.
  if (input.totalAmount <= 0) throw new Error("Invalid payment amount");
}

export async function confirmReservationActivity(orderId: string): Promise<void> {
  await confirmReservation(orderId);
}

export async function releaseReservationActivity(orderId: string): Promise<void> {
  await releaseReservation(orderId);
}

export async function markOrderStatusActivity(orderId: string, status: string): Promise<void> {
  await prisma.order.update({ where: { id: orderId }, data: { status } });
}
