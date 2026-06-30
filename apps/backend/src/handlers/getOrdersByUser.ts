import type { Request, Response } from "express";
import type { Handler } from "openapi-backend";
import { prisma } from "../lib/prisma";
import { ORDERS_QUERY } from "../constants/orders";

// Read side served directly from database. Path params come from the openapi-backend
// context — express req.params is empty under the catch-all route.
export const getOrdersByUserHandler: Handler = async (c, _req: Request, res: Response) => {
  const userId = c.request.params.userId as string;
  const limit = Math.min(
    ORDERS_QUERY.maxLimit,
    Number(c.request.query.limit ?? ORDERS_QUERY.defaultLimit),
  );

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const rows = await prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const orders = rows.map((o) => ({
      orderId: o.id,
      userId: o.userId,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      description: o.description ?? undefined,
      createdAt: o.createdAt,
    }));

    return res.status(200).json({ orders, limit });
  } catch (err) {
    console.error("Database read error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
