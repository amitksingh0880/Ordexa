import type { Request, Response } from "express";
import type { Handler } from "openapi-backend";
import { prisma } from "../lib/prisma";

// Lists current stock levels for the inventory management UI.
export const getInventoryHandler: Handler = async (_c, _req: Request, res: Response) => {
  try {
    const rows = await prisma.inventory.findMany({ orderBy: { sku: "asc" } });

    const items = rows.map((i) => ({
      sku: i.sku,
      name: i.name,
      available: i.available,
      reserved: i.reserved,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    console.error("Inventory read error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
