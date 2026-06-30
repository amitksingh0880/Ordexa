import type { Request, Response } from "express";
import type { Handler } from "openapi-backend";
import { OrderService } from "../services/order.service";
import {
  InsufficientInventoryError,
  UnknownSkuError,
} from "../services/inventory.service";
import { VALIDATION } from "../constants/orders";

export const createOrderHandler: Handler = async (
  _context,
  req: Request,
  res: Response,
) => {
  try {
    const { userId, totalAmount, status, description, sku, quantity } = req.body as {
      userId?: string;
      totalAmount?: number;
      status?: string;
      description?: string;
      sku?: string;
      quantity?: number;
    };

    if (
      !userId ||
      typeof userId !== "string" ||
      !VALIDATION.userIdPattern.test(userId) ||
      typeof totalAmount !== "number" ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        isError: true,
        errorMessage: "Invalid request body",
      });
    }

    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
      return res.status(400).json({
        isError: true,
        errorMessage: "Invalid quantity",
      });
    }

    const orderService = new OrderService();
    const order = await orderService.createOrder({
      userId,
      totalAmount,
      status,
      description,
      sku,
      quantity,
    });

    return res.status(201).json({
      isError: false,
      message: "Order created successfully",
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    if (err instanceof InsufficientInventoryError) {
      return res.status(409).json({ isError: true, errorMessage: err.message });
    }
    if (err instanceof UnknownSkuError) {
      return res.status(400).json({ isError: true, errorMessage: err.message });
    }
    console.error("❌ Error creating order:", err);
    return res.status(500).json({
      isError: true,
      errorMessage: "Internal server error",
    });
  }
};
