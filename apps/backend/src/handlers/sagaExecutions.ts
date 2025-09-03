import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";


export async function getSagaExecutions(req: Request, res: Response) {
  try {
    const { sagaName, status } = req.query;

    const sagaExecutions = await prisma.sagaExecution.findMany({
      where: {
        ...(sagaName ? { sagaName: String(sagaName) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      orderBy: { startedAt: "desc" },
    });

    res.json(sagaExecutions);
  } catch (error) {
    console.error("❌ Failed to fetch saga executions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
