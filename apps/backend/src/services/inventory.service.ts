import { prisma } from "../lib/prisma";
import { ReservationStatus } from "../constants/orders";

/**
 * Thrown when there isn't enough sellable stock to satisfy a reservation.
 * Treated as a non-retryable, terminal failure by the orchestrators.
 */
export class InsufficientInventoryError extends Error {
  constructor(
    public readonly sku: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Insufficient inventory for ${sku}: requested ${requested}, available ${available}`);
    this.name = "InsufficientInventoryError";
  }
}

export class UnknownSkuError extends Error {
  constructor(public readonly sku: string) {
    super(`Unknown SKU: ${sku}`);
    this.name = "UnknownSkuError";
  }
}

export interface ReserveInput {
  orderId: string;
  sku: string;
  quantity: number;
}

/**
 * Reserve `quantity` units of `sku` for `orderId`, transactionally moving stock
 * from `available` to `reserved`. Idempotent per order: a second call for an
 * order that is already RESERVED/CONFIRMED is a no-op that returns the existing
 * reservation (so retries — from the Saga or Temporal — are safe).
 */
export async function reserveInventory({ orderId, sku, quantity }: ReserveInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.inventoryReservation.findUnique({ where: { orderId } });
    if (existing && existing.status !== ReservationStatus.Released) {
      return existing; // already held — idempotent
    }

    const item = await tx.inventory.findUnique({ where: { sku } });
    if (!item) throw new UnknownSkuError(sku);
    if (item.available < quantity) {
      throw new InsufficientInventoryError(sku, quantity, item.available);
    }

    await tx.inventory.update({
      where: { sku },
      data: { available: { decrement: quantity }, reserved: { increment: quantity } },
    });

    return tx.inventoryReservation.upsert({
      where: { orderId },
      create: { orderId, sku, quantity, status: ReservationStatus.Reserved },
      update: { sku, quantity, status: ReservationStatus.Reserved },
    });
  });
}

/**
 * Confirm a held reservation: the units leave the warehouse, so drop them from
 * `reserved` without returning them to `available`. Idempotent.
 */
export async function confirmReservation(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const r = await tx.inventoryReservation.findUnique({ where: { orderId } });
    if (!r || r.status !== ReservationStatus.Reserved) return r; // nothing to confirm

    await tx.inventory.update({
      where: { sku: r.sku },
      data: { reserved: { decrement: r.quantity } },
    });

    return tx.inventoryReservation.update({
      where: { orderId },
      data: { status: ReservationStatus.Confirmed },
    });
  });
}

/**
 * Compensation step: release a held reservation back to `available`. Idempotent
 * — only RESERVED holds are released; CONFIRMED/RELEASED are left untouched.
 */
export async function releaseReservation(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const r = await tx.inventoryReservation.findUnique({ where: { orderId } });
    if (!r || r.status !== ReservationStatus.Reserved) return r; // nothing to release

    await tx.inventory.update({
      where: { sku: r.sku },
      data: { available: { increment: r.quantity }, reserved: { decrement: r.quantity } },
    });

    return tx.inventoryReservation.update({
      where: { orderId },
      data: { status: ReservationStatus.Released },
    });
  });
}
