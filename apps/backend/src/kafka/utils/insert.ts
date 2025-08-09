import { cassandraClient } from "./cassandra";
import { types } from 'cassandra-driver';

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
    ) VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    types.Uuid.fromString(data.userId),   // ✅ convert from string to UUID
    types.Uuid.fromString(data.orderId),  // ✅ convert from string to UUID
    data.status,
    data.totalAmount,
    new Date(data.createdAt),
  ];

  await cassandraClient.execute(query, params, { prepare: true });
}
