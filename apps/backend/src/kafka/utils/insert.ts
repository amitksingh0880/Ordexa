// kafka/utils/insert.ts
import { cassandraClient } from "./cassandra";

export async function insertOrderIntoCassandra(data: {
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}) {
  const query = `
    INSERT INTO orders_by_user (
      user_id, order_id, status, total_amount, created_at
    ) VALUES (?, now(), ?, ?, ?)`;

  const params = [
    data.userId,
    data.status,
    data.totalAmount,
    new Date(data.createdAt),
  ];

  await cassandraClient.execute(query, params, { prepare: true });
}
