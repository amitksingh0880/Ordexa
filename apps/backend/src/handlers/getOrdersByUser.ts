import type { Handler } from "openapi-backend";
import { OrderReadService } from "../services/orderRead.service";

export const getOrdersByUser: Handler = async (c, req, res) => {
  const userId = c.request.params.userId;
  const limit = parseInt(c.request.query.limit || "10", 10);
  const offset = parseInt(c.request.query.offset || "0", 10);

  const service = new OrderReadService();
  const orders = await service.fetchUserOrders(userId, limit, offset);

  return res.status(200).json({ orders });
};