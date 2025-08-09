import { cassandraClient } from "./cassandra";
import { types } from "cassandra-driver";

export async function insertOrderIntoCassandra(data: {
  userId: string;       // e.g. "user-1"
  orderId: string;      // e.g. "11111111-1111-1111-1111-111111111111"
  status: string;
  totalAmount: number;
  createdAt: string;
}): Promise<void> {
  try {
    console.log("Inserting order into Cassandra:", data);

    // Convert orderId to UUID, userId as string (if your Cassandra schema uses text for user_id)
    const orderUUID = types.Uuid.fromString(data.orderId);

    await cassandraClient.execute(
      "INSERT INTO orders_by_user (user_id, order_id, status, total_amount, created_at) VALUES (?, ?, ?, ?, ?)",
      [data.userId, orderUUID, data.status, data.totalAmount, new Date(data.createdAt)],
      { prepare: true }
    );
  } catch (error) {
    console.error(`Error inserting order ${data.orderId}:`, error);
    throw error;
  }
}
