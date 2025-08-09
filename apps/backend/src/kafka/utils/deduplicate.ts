// // kafka/utils/deduplicate.ts
// import { cassandraClient } from "./cassandra";

// const TABLE_NAME = "event_log";

// export async function isEventProcessed(eventId: string): Promise<boolean> {
//   const query = `SELECT event_id FROM ${TABLE_NAME} WHERE event_id = ?`;
//   const result = await cassandraClient.execute(query, [eventId], { prepare: true });
//   return result.rowLength > 0;
// }

// export async function markEventProcessed(eventId: string): Promise<void> {
//   const query = `INSERT INTO ${TABLE_NAME} (event_id, created_at) VALUES (?, toTimestamp(now()))`;
//   await cassandraClient.execute(query, [eventId], { prepare: true });
// }


// import { cassandraClient } from "./cassandra";

// export async function isEventProcessed(eventId: string): Promise<boolean> {
//   const query = `SELECT event_id FROM processed_events WHERE event_id = ?`;
//   const result = await cassandraClient.execute(query, [eventId], { prepare: true });
//   return result.rowLength > 0;
// }

// export async function markEventProcessed(eventId: string): Promise<void> {
//   const query = `INSERT INTO processed_events (event_id) VALUES (?)`;
//   await cassandraClient.execute(query, [eventId], { prepare: true });
// }




// src/kafka/utils/deduplicate.ts
import { cassandraClient } from "./cassandra";
import { types } from "cassandra-driver";

export async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const result = await cassandraClient.execute(
      "SELECT event_id FROM event_log WHERE event_id = ?",
      [types.Uuid.fromString(eventId)],
      { prepare: true }
    );
    return result.rowLength > 0;
  } catch (error) {
    console.error(`Error checking event ${eventId}:`, error);
    throw error;
  }
}


export async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await cassandraClient.execute(
      "INSERT INTO event_log (event_id) VALUES (?)",
      [types.Uuid.fromString(eventId)],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error marking event ${eventId} as processed:`, error);
    throw error;
  }
}
