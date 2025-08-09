// import { cassandraClient } from "./cassandra";

// export async function insertOrderIntoCassandra(data: {
//   orderId: string;
//   userId: string;
//   status: string;
//   totalAmount: number;
//   createdAt: string;
// }) {
//   const query = `
//     INSERT INTO orders_by_user (
//       user_id, order_id, status, total_amount, created_at
//     ) VALUES (?, ?, ?, ?, ?)`;

//   const params = [
//     data.userId,
//     data.orderId,
//     data.status,
//     data.totalAmount,
//     new Date(data.createdAt),
//   ];

//   console.log("📦 Inserting into Cassandra:", params);

//   try {
//     await cassandraClient.execute(query, params, { prepare: true });
//   } catch (err) {
//     console.error("❌ Cassandra insert failed:", err);
//   }
// }


// src/kafka/utils/insert.ts
import { cassandraClient } from "./cassandra";
import { types } from "cassandra-driver";

export async function insertOrderIntoCassandra(data: {
  userId: string;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}): Promise<void> {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.userId)) {
      throw new Error(`Invalid UUID format for userId: ${data.userId}`);
    }

    await cassandraClient.execute(
      "INSERT INTO orders_by_user (user_id, order_id, status, total_amount, created_at) VALUES (?, ?, ?, ?, ?)",
      [types.Uuid.fromString(data.userId), data.orderId, data.status, data.totalAmount, new Date(data.createdAt)],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting order ${data.orderId}:`, error);
    throw error;
  }
}