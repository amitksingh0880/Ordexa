export type OrderCreatedEvent = {
  eventId: string;
  orderId: string;
  eventType: "OrderCreated";
  timestamp: string;
  data: {
    userId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
};
