import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "ordexa-consumer",
  brokers: ["localhost:9092"],
});

export const consumer = kafka.consumer({ groupId: "order-sync-group" });

export async function connectConsumer() {
  try {
    await consumer.connect();
    console.log("✅ Kafka Consumer connected");

    await consumer.subscribe({
      topic: "order.created",
      fromBeginning: false,
    });
    console.log("🔁 Subscribed to topic: order.created");
  } catch (err) {
    console.error("❌ Failed to connect or subscribe Kafka Consumer", err);
    process.exit(1);
  }
}
