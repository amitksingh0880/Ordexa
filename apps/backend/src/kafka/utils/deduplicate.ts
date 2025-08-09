import { cassandraClient } from "./cassandra";

const TABLE_NAME = "event_log";

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const query = `SELECT event_id FROM ${TABLE_NAME} WHERE event_id = ?`;
  const result = await cassandraClient.execute(query, [eventId], { prepare: true });
  return result.rowLength > 0;
}

export async function markEventProcessed(eventId: string): Promise<void> {
  const query = `INSERT INTO ${TABLE_NAME} (event_id, created_at) VALUES (?, toTimestamp(now()))`;
  await cassandraClient.execute(query, [eventId], { prepare: true });
}
