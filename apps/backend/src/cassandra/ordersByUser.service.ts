import { cassandraClient } from "../kafka/utils/cassandra";


export async function getOrdersByUser(userId: string, cursor?: string, limit = 10) {
  const params = [userId];
  let query = `
    SELECT order_id, status, total_amount, created_at
    FROM orders_by_user
    WHERE user_id = ?
  `;

  if (cursor) {
    query += ` AND created_at <= ?`;
    params.push(cursor);
  }

  query += ` LIMIT ${limit};`;

  const result = await cassandraClient.execute(query, params, { prepare: true });
  return result.rows;
}
