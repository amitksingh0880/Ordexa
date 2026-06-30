export type ColumnType = "string" | "number" | "boolean" | "array";

export interface ProductColumn {
  key: string;
  header: string;
  type: ColumnType;
  required: boolean;
  example: string;
}

// Single source of truth for the bulk-import shape: both the downloadable
// template and the row parser are derived from this list.
export const PRODUCT_COLUMNS: ProductColumn[] = [
  { key: "slug", header: "slug", type: "string", required: true, example: "ordexa-series-a" },
  { key: "name", header: "name", type: "string", required: true, example: "Ordexa Series A" },
  { key: "series", header: "series", type: "string", required: true, example: "Signature Series" },
  { key: "collectionSlug", header: "collectionSlug", type: "string", required: true, example: "signature" },
  { key: "description", header: "description", type: "string", required: true, example: "A precision-minimal object." },
  { key: "price", header: "price", type: "number", required: true, example: "1240" },
  { key: "currency", header: "currency", type: "string", required: false, example: "INR" },
  { key: "badge", header: "badge", type: "string", required: false, example: "New" },
  { key: "finishes", header: "finishes", type: "array", required: false, example: "#000000;#ffffff" },
  { key: "colors", header: "colors", type: "array", required: false, example: "#000000;#8C8880" },
  { key: "images", header: "images", type: "array", required: false, example: "https://img/a.jpg;https://img/b.jpg" },
  { key: "featured", header: "featured", type: "boolean", required: false, example: "false" },
];

export const ARRAY_DELIMITER = /[;,]/;
export const TEMPLATE_SHEET = "Products";
export const TEMPLATE_FILENAME = "ordexa-products-template.xlsx";
