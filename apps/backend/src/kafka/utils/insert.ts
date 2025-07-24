import { cassandraClient } from "./cassandra";

export async function insertOrderIntoCassandra(data: {
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}) {
  const query = `
    INSERT INTO orders_by_user (
      user_id, order_id, status, total_amount, created_at
    ) VALUES (?, ?, ?, ?, ?)`;

  const params = [
    data.userId,
    data.orderId,
    data.status,
    data.totalAmount,
    new Date(data.createdAt),
  ];

  console.log("📦 Inserting into Cassandra:", params);

  try {
    await cassandraClient.execute(query, params, { prepare: true });
  } catch (err) {
    console.error("❌ Cassandra insert failed:", err);
  }
}
