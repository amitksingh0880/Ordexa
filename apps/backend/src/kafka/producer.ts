import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "ordexa-backend",
  brokers: ["localhost:9092"],
  logLevel: logLevel.INFO,
});

export const producer = kafka.producer();

export async function connectProducer() {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer connected");
  } catch (err) {
    console.error("❌ Failed to connect Kafka producer", err);
    process.exit(1); // fail fast
  }
}
