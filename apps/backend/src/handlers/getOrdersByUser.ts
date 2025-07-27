import type { Handler } from "openapi-backend";
import { OrderReadService } from "../services/orderRead.service";

export const getOrdersByUser: Handler = async (c, req, res) => {
  const userId = c.request.params.userId;
  const limit = parseInt(c.request.query.limit || "10", 10);
  const offset = parseInt(c.request.query.offset || "0", 10);

  // Validate limit and offset
  const MAX_LIMIT = 100;
  if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
    return res.status(400).json({ error: `Invalid 'limit' value. Must be an integer between 1 and ${MAX_LIMIT}.` });
  }
  if (isNaN(offset) || offset < 0) {
    return res.status(400).json({ error: "Invalid 'offset' value. Must be a non-negative integer." });
  }
  const service = new OrderReadService();
  const orders = await service.fetchUserOrders(userId, limit, offset);

  return res.status(200).json({ orders });
};