// import { Kafka } from "kafkajs";
// import { handleOrderCreated } from "../handler/orderCreated";

// const kafka = new Kafka({
//   clientId: "order-consumer",
//   brokers: ["localhost:9092"], 
// });

// const consumer = kafka.consumer({ groupId: "order-consumer-group" });

// export async function startKafkaConsumer() {
//   await consumer.connect();
//   console.log("Kafka Consumer connected");

//   await consumer.subscribe({ topic: "order.created", fromBeginning: false });

//   await consumer.run({
//   eachMessage: async ({ topic, partition, message }) => {
//     try {
//       const rawValue = message.value?.toString();
//       if (!rawValue) {
//         console.warn("Received empty message, skipping");
//         return;
//       }

//   const event = JSON.parse(rawValue);
// console.log("Received raw event:", JSON.stringify(event, null, 2));  


//       await handleOrderCreated(event);

//       console.log(`Processed event ${event.eventId} from topic ${topic} partition ${partition}`);
//     } catch (error) {
//       console.error("Error processing Kafka message:", error);
//     }
//   },
// });

// }

// startKafkaConsumer().catch((err) => {
//   console.error("Kafka consumer failed to start:", err);
// });



import { Kafka } from "kafkajs";
import { handleOrderCreated } from "../handler/orderCreated";
import { handleOrderConfirmed } from "../handler/orderConfirmed";

const kafka = new Kafka({
  clientId: "order-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "order-consumer-group" });

export async function startKafkaConsumer() {
  await consumer.connect();
  console.log("✅ Kafka Consumer connected");

  // Subscribe to both topics
  await consumer.subscribe({ topic: "order.created", fromBeginning: false });
  await consumer.subscribe({ topic: "order-lifecycle", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const rawValue = message.value?.toString();
        if (!rawValue) {
          console.warn("⚠️ Received empty message, skipping");
          return;
        }

        const event = JSON.parse(rawValue);
        console.log("📨 Received Event:", JSON.stringify(event, null, 2));

        // 🔀 Route based on topic
        if (topic === "order.created") {
          await handleOrderCreated(event);
        } else if (topic === "order-lifecycle") {
          switch (event.eventType) {
            case "OrderConfirmed":
              await handleOrderConfirmed(event);
              break;
            default:
              console.warn(`⚠️ Unhandled event type: ${event.eventType}`);
          }
        }

        console.log(`✅ Processed event ${event.eventId} from ${topic} partition ${partition}`);
      } catch (error) {
        console.error("❌ Error processing Kafka message:", error);
      }
    },
  });
}

startKafkaConsumer().catch((err) => {
  console.error("❌ Kafka consumer failed to start:", err);
});
