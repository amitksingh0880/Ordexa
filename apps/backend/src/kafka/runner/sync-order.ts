// kafka/runner/sync-order.ts
import { Kafka } from "kafkajs";
import { handleOrderCreated } from "../handler/orderCreated";

const kafka = new Kafka({
  clientId: "ordexa-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "order-consumers" });

export async function runOrderConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "order.created", fromBeginning: false });

  console.log("👂 Listening for 'order.created' events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        await handleOrderCreated(event);
      } catch (err) {
        console.error("❌ Failed to process event:", err);
      }
    },
  });
}

if (require.main === module) {
  runOrderConsumer().catch(console.error);
}
