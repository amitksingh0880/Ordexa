// src/types/events.ts
export type OrderCreatedEvent = {
  eventId: string;
  orderId: string;
  eventType: "OrderCreated";
  timestamp: string;
  data: {
    orderId: string;
    userId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
};