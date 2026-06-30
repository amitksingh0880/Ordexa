import { apiHttp } from "./http";
import { PRODUCT_IMPORT_ENDPOINTS } from "../constants/app";

export interface ImportRowResult {
  row: number;
  slug?: string;
  status: "created" | "updated" | "error";
  message?: string;
}

export interface ImportResponse {
  results: ImportRowResult[];
  summary: { created: number; updated: number; errors: number };
}

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const productImport = {
  async downloadTemplate(): Promise<void> {
    const res = await apiHttp.get(PRODUCT_IMPORT_ENDPOINTS.template, { responseType: "blob" });
    const match = /filename="?([^"]+)"?/.exec(res.headers["content-disposition"] ?? "");
    triggerDownload(res.data as Blob, match?.[1] ?? "products-template.xlsx");
  },
  async upload(file: File): Promise<ImportResponse> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiHttp.post<{ data: ImportResponse }>(
      PRODUCT_IMPORT_ENDPOINTS.import,
      form,
    );
    return data.data;
  },
};
