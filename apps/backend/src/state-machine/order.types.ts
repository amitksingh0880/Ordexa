export type OrderState =
  | 'Created'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type OrderEvent =
  | 'CONFIRM_ORDER'
  | 'SHIP_ORDER'
  | 'DELIVER_ORDER'
  | 'CANCEL_ORDER';

export interface OrderTransition {
  from: OrderState;
  event: OrderEvent;
  to: OrderState;
}
