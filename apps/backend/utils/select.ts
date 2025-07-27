import { cassandraClient } from "../src/kafka/utils/cassandra";

// apps/backend/src/utils/select.ts
export type OrderRow = {
  user_id: string;
  order_id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export async function getOrdersByUserId(
  userId: string,
  limit: number,
  offset: number
): Promise<OrderRow[]> {
  const query = `
    SELECT * FROM orders_by_user WHERE user_id = ? LIMIT ?
  `;
  const result = await cassandraClient.execute(query, [userId, limit], {
    prepare: true,
  });

  return result.rows.map((row) => ({
    user_id: row["user_id"],
    order_id: row["order_id"],
    status: row["status"],
    total_amount: row["total_amount"],
    created_at: row["created_at"],
  }));
}
