import type { Request, Response } from "express";
import type { Handler } from "openapi-backend";
import { prisma } from "../lib/prisma";

// Lists current stock levels for the inventory management UI.
export const getInventoryHandler: Handler = async (_c, req: Request, res: Response) => {
  try {
    const rows = await prisma.inventory.findMany({
      where: req.tenantId ? { tenantId: req.tenantId } : undefined,
      orderBy: { sku: "asc" },
    });

    const items = rows.map((i) => ({
      sku: i.sku,
      name: i.name,
      price: i.price,
      currency: i.currency,
      available: i.available,
      reserved: i.reserved,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    console.error("Inventory read error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
