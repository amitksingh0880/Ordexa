export type OrderCreatedEvent = {
  eventId: string;
  orderId: string;
  eventType: "OrderCreated";
  data: {
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  timestamp: string;
};
