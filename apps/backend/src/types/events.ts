export type OrderCreatedEvent = {
  eventId: string;
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
