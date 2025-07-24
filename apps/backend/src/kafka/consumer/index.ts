import { Kafka } from "kafkajs";
import { handleOrderCreated } from "../handler/orderCreated";

const kafka = new Kafka({
  clientId: "order-consumer",
  brokers: ["localhost:9092"], 
});

const consumer = kafka.consumer({ groupId: "order-consumer-group" });

export async function startKafkaConsumer() {
  await consumer.connect();
  console.log("Kafka Consumer connected");

  await consumer.subscribe({ topic: "order.created", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const rawValue = message.value?.toString();
        if (!rawValue) {
          console.warn("Received empty message, skipping");
          return;
        }

        const event = JSON.parse(rawValue);
        await handleOrderCreated(event);

        console.log(
          `Processed event ${event.eventId} from topic ${topic} partition ${partition}`
        );
      } catch (error) {
        console.error("Error processing Kafka message:", error);
      }
    },
  });
}
