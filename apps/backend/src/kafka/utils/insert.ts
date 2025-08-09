// src/kafka/utils/insert.ts
import { cassandraClient } from "./cassandra";
import { types } from "cassandra-driver";

export async function insertOrderIntoCassandra(data: {
  userId: string;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  currency?: string;
  description?: string;
}): Promise<void> {
  try {
    console.log("Inserting order into orders_by_user:", data);

    const orderUUID = types.Uuid.fromString(data.orderId);

    await cassandraClient.execute(
      `INSERT INTO ordexa_read.orders_by_user
        (user_id, order_id, status, total_amount, created_at, updated_at, currency, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        orderUUID,
        data.status,
        data.totalAmount,
        new Date(data.createdAt),
        data.updatedAt ? new Date(data.updatedAt) : new Date(),
        data.currency || "USD",
        data.description || "",
      ],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting order ${data.orderId}:`, error);
    throw error;
  }
}

export async function insertOutboxEvent(data: {
  id: string;
  aggregateId: string;
  aggregateType: string;
  createdAt: string;
  eventType: string;
  payload: string;
  processed: boolean;
  retries: number;
}): Promise<void> {
  try {
    console.log("Inserting outbox event:", data);

    await cassandraClient.execute(
      `INSERT INTO ordexa_read.outbox_events
        (id, aggregate_id, aggregate_type, created_at, event_type, payload, processed, retries)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        types.Uuid.fromString(data.id),
        types.Uuid.fromString(data.aggregateId),
        data.aggregateType,
        new Date(data.createdAt),
        data.eventType,
        data.payload,
        data.processed,
        data.retries,
      ],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting outbox event ${data.id}:`, error);
    throw error;
  }
}

export async function insertProcessedEvent(data: {
  eventId: string;
  processedAt: string;
}): Promise<void> {
  try {
    console.log("Inserting processed event:", data);

    await cassandraClient.execute(
      `INSERT INTO ordexa_read.processed_events
        (event_id, processed_at)
       VALUES (?, ?)`,
      [types.Uuid.fromString(data.eventId), new Date(data.processedAt)],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting processed event ${data.eventId}:`, error);
    throw error;
  }
}

export async function insertEventLog(data: {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  createdAt: string;
  eventType: string;
  payload: string;
}): Promise<void> {
  try {
    console.log("Inserting event log:", data);

    await cassandraClient.execute(
      `INSERT INTO ordexa_read.event_log
        (event_id, aggregate_id, aggregate_type, created_at, event_type, payload)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        types.Uuid.fromString(data.eventId),
        types.Uuid.fromString(data.aggregateId),
        data.aggregateType,
        new Date(data.createdAt),
        data.eventType,
        data.payload,
      ],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting event log ${data.eventId}:`, error);
    throw error;
  }
}
