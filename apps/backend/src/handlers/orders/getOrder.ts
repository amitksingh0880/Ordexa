import type { Request, Response } from "express";
import { getOrdersByUser } from "../../cassandra/ordersByUser.service";
import type { Context } from "openapi-backend";

// export async function getOrdersHandler(_c: any, req: Request) {
//   const { userId } = _c.request.params;
//   const { cursor, limit } = _c.request.query;

//   if (!userId) {
//     return _c.response.status(400).json({ error: "Missing userId in path params" });
//   }

//   const orders = await getOrdersByUser(
//     userId,
//     typeof cursor === "string" ? cursor : undefined,
//     limit ? parseInt(limit as string, 10) || 10 : 10
//   );

//   return _c.response.status(200).json({ data: orders, nextCursor: getNextCursor(orders) });
// }

export async function getOrdersHandler(
  c: any,
  _req: Request,
  res: Response
) {
  const { userId } = c.request.params;
  const { cursor, limit } = c.request.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in path params" });
  }

  const orders = await getOrdersByUser(
    userId,
    typeof cursor === "string" ? cursor : undefined,
    limit ? parseInt(limit as string, 10) || 10 : 10
  );

  return res.status(200).json({ data: orders, nextCursor: getNextCursor(orders) });
}

function getNextCursor(orders: any[]) {
  if (!orders.length) return null;
  return orders[orders.length - 1].created_at;
}

