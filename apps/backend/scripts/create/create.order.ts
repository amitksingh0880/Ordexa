import { createOrder } from "../../src/handlers/create/order.created";

(async () => {
  const order = await createOrder({
    userId: "user-1",
    status: "Created",
    totalAmount: 120.5,
  });

  console.log("✅ Created Order with Outbox event:", order.id);
})();
