import type { Request, Response } from "express";
import type { Handler } from "openapi-backend";
import { OrderService } from "../services/order.service";

export const createOrderHandler: Handler = async (
  _context,
  req: Request,
  res: Response,
) => {
  try {
    const { userId, totalAmount, status } = req.body as {
      userId?: string;
      totalAmount?: number;
      status?: string;
    };

    if (
      !userId ||
      typeof userId !== "string" ||
      !/^[0-9a-f-]{36}$/.test(userId) ||
      typeof totalAmount !== "number" ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        isError: true,
        errorMessage: "Invalid request body",
      });
    }

    const orderService = new OrderService();
    const order = await orderService.createOrder({ userId, totalAmount, status: status ?? "pending" });

    if (!order) {
      return res.status(500).json({
        isError: true,
        errorMessage: "Order creation failed",
      });
    }

    return res.status(201).json({
      isError: false,
      message: "Order created successfully",
      orderId: order.id,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({
      isError: true,
      errorMessage: "Internal server error",
    });
  }
};
