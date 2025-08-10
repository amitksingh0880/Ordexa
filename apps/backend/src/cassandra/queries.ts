export const SELECT_ORDERS_BY_USER = `
  SELECT order_id, user_id, status, total_amount, created_at
  FROM orders_by_user
  WHERE user_id = ?
`;