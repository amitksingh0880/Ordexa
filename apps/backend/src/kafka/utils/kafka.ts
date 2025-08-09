import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "ordexa-app",
  brokers: ["localhost:9092"],
});
