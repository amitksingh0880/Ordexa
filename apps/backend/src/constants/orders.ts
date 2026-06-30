// ─────────────────────────────────────────────────────────────────────────────
// Domain constants — the single source of truth for order/inventory values.
// Pure module (no imports, no I/O) so it is safe to import from anywhere,
// including the Temporal workflow sandbox.
// ─────────────────────────────────────────────────────────────────────────────

export const OrderStatus = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Failed: "Failed",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Allowed admin status transitions (drives accept/reject/ship/deliver actions).
export const ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.Shipped]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: [],
  [OrderStatus.Failed]: [],
};

export const ReservationStatus = {
  Reserved: "RESERVED",
  Confirmed: "CONFIRMED",
  Released: "RELEASED",
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

// Defaults applied when an order omits inventory details.
export const INVENTORY_DEFAULTS = {
  sku: "DEMO-SKU",
  quantity: 1,
} as const;

// Outbox/event metadata.
export const ORDER_EVENT = {
  aggregateType: "Order",
  createdType: "OrderCreated",
} as const;

// Temporal workflow identity + saga retry/timeout policy.
export const ORDER_WORKFLOW = {
  type: "orderWorkflow",
  idPrefix: "order-",
  activityStartToCloseTimeout: "30 seconds",
  activityMaxAttempts: 3,
} as const;

// Request validation.
export const VALIDATION = {
  userIdPattern: /^[0-9a-f-]{36}$/,
} as const;

// Read endpoint paging.
export const ORDERS_QUERY = {
  defaultLimit: 25,
  maxLimit: 100,
} as const;
