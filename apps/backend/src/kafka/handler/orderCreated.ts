// kafka/handler/orderCreated.ts
import { error } from "node:console";
import { isEventProcessed, markEventProcessed } from "../utils/deduplicate";
import { insertOrderIntoCassandra } from "../utils/insert";

type OrderCreatedEvent = {
  eventId: string;
  orderId: string;
  eventType: "OrderCreated";
  data: {
    orderId: string,
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  timestamp: string;
};

export async function handleOrderCreated(event: OrderCreatedEvent) {
  const alreadyProcessed = await isEventProcessed(event.eventId);
  if (alreadyProcessed) {
    console.log(`⚠️ Duplicate event ${event.eventId}, skipping`);
    return;
  }

  console.log("📥 Handling OrderCreated event:", event.orderId);
   try{
          await insertOrderIntoCassandra({
      orderId: event.data.orderId, // pass orderId
      userId: event.data.userId,
      status: event.data.status,
      totalAmount: event.data.totalAmount,
      createdAt: event.data.createdAt, // should be valid date string
    });
   }catch(err){
          console.error("❌ Failed to insert into Cassandra:", err);
   }
    


  await markEventProcessed(event.eventId);
  console.log("✅ Order inserted & event marked as processed:", event.orderId);
}
