
import { connectCassandra } from "../../utils/cassandra";
import {
  insertOrderIntoCassandra,
  insertOutboxEvent,
  insertProcessedEvent,
  insertEventLog,
} from "../../utils/insert";
import { v4 as uuidv4 } from "uuid";

async function runTest() {
  await connectCassandra();

  const now = new Date().toISOString();

  // Insert order_by_user
  await insertOrderIntoCassandra({
    userId: "user-test-123",
    orderId: uuidv4(),
    status: "Created",
    totalAmount: 100.5,
    createdAt: now,
    updatedAt: now,
    currency: "USD",
    description: "Test order insertion",
  });

  // Insert outbox event
  await insertOutboxEvent({
    id: uuidv4(),
    aggregateId: uuidv4(),
    aggregateType: "Order",
    createdAt: now,
    eventType: "OrderCreated",
    payload: JSON.stringify({ orderId: "sample", status: "Created" }),
    processed: false,
    retries: 0,
  });

  // Insert processed event
  await insertProcessedEvent({
    eventId: uuidv4(),
    processedAt: now,
  });

  // Insert event log
  await insertEventLog({
    eventId: uuidv4(),
    aggregateId: uuidv4(),
    aggregateType: "Order",
    createdAt: now,
    eventType: "OrderCreated",
    payload: JSON.stringify({ orderId: "sample", status: "Created" }),
  });

  console.log("✅ All inserts completed");
  process.exit(0);
}

runTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
