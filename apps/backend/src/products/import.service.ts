import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma";
import { config } from "../config/env";
import {
  PRODUCT_COLUMNS,
  ARRAY_DELIMITER,
  TEMPLATE_SHEET,
  type ProductColumn,
} from "./columns";

export interface RowResult {
  row: number;
  slug?: string;
  status: "created" | "updated" | "error";
  message?: string;
}

export const buildTemplate = async (): Promise<Buffer> => {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet(TEMPLATE_SHEET);
  sheet.columns = PRODUCT_COLUMNS.map((c) => ({
    header: c.required ? `${c.header}*` : c.header,
    key: c.key,
    width: Math.max(14, c.header.length + 4),
  }));
  sheet.addRow(Object.fromEntries(PRODUCT_COLUMNS.map((c) => [c.key, c.example])));
  sheet.getRow(1).font = { bold: true };
  return Buffer.from(await wb.xlsx.writeBuffer());
};

type ProductInput = {
  slug: string;
  name: string;
  series: string;
  collectionSlug: string;
  description: string;
  price: number;
  currency: string;
  badge?: string;
  finishes: string[];
  colors: string[];
  images: string[];
  featured: boolean;
};

const coerce = (column: ProductColumn, raw: unknown): unknown => {
  const value = raw === null || raw === undefined ? "" : String(raw).trim();
  switch (column.type) {
    case "number":
      return value === "" ? undefined : Number(value);
    case "boolean":
      return value === "" ? false : ["true", "1", "yes"].includes(value.toLowerCase());
    case "array":
      return value === "" ? [] : value.split(ARRAY_DELIMITER).map((s) => s.trim()).filter(Boolean);
    default:
      return value;
  }
};

const parseRecord = (record: Record<string, unknown>): { data?: ProductInput; error?: string } => {
  const out: Record<string, unknown> = {};
  for (const column of PRODUCT_COLUMNS) {
    const value = coerce(column, record[column.header] ?? record[`${column.header}*`]);
    if (column.required && (value === undefined || value === "")) {
      return { error: `Missing required '${column.header}'` };
    }
    if (column.type === "number" && value !== undefined && Number.isNaN(value)) {
      return { error: `'${column.header}' must be a number` };
    }
    out[column.key] = value;
  }
  if (!out.currency) out.currency = config.shipping.currency;
  return { data: out as ProductInput };
};

export const importProducts = async (
  buffer: Buffer,
  tenantId: string,
): Promise<RowResult[]> => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, col) => {
    headers[col] = String(cell.value ?? "").trim().replace(/\*$/, "");
  });

  const results: RowResult[] = [];
  for (let r = 2; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    if (!row.hasValues) continue;

    const record: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      if (headers[col]) record[headers[col]] = cell.value;
    });

    const { data, error } = parseRecord(record);
    if (error || !data) {
      results.push({ row: r, status: "error", message: error });
      continue;
    }
    try {
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      const record = { ...data, tenantId };
      await prisma.product.upsert({ where: { slug: data.slug }, create: record, update: record });
      results.push({ row: r, slug: data.slug, status: existing ? "updated" : "created" });
    } catch (err) {
      results.push({ row: r, slug: data.slug, status: "error", message: (err as Error).message });
    }
  }
  return results;
};
