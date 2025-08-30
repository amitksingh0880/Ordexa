import type { OrderTransition } from "./order.types";


export const orderTransitions: OrderTransition[] = [
  { from: 'Created', event: 'CONFIRM_ORDER', to: 'Confirmed' },
  { from: 'Confirmed', event: 'SHIP_ORDER', to: 'Shipped' },
  { from: 'Shipped', event: 'DELIVER_ORDER', to: 'Delivered' },

  { from: 'Created', event: 'CANCEL_ORDER', to: 'Cancelled' },
  { from: 'Confirmed', event: 'CANCEL_ORDER', to: 'Cancelled' },
];
