import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Download, Upload } from "lucide-react";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/components/ui/dialog";
import { Input } from "@ui/components/ui/input";
import { AutoForm } from "@ui/components/ui/auto-form";
import { formatCurrency } from "../lib/format";
import { products, collections } from "../lib/resources";
import { productImport, type ImportResponse } from "../lib/upload";
import { useAuth } from "../context/auth-context";
import { CURRENCY, PRODUCT_COPY, ARN_MODULES, ARN_ACTIONS } from "../constants/app";
import type { Product } from "../types/domain";

const productSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  series: z.string().min(1, "Series is required"),
  collectionSlug: z.string().min(1, "Collection is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().min(1),
  badge: z.string().optional(),
  finishes: z.array(z.string()),
  colors: z.array(z.string()),
  images: z.array(z.string()),
  featured: z.enum(["Featured", "Standard"]),
});
type ProductForm = z.infer<typeof productSchema>;

const toForm = (p: Product): Partial<ProductForm> => ({
  slug: p.slug,
  name: p.name,
  series: p.series,
  collectionSlug: p.collectionSlug,
  description: p.description,
  price: p.price,
  currency: p.currency,
  badge: p.badge ?? "",
  finishes: p.finishes ?? [],
  colors: p.colors ?? [],
  images: p.images ?? [],
  featured: p.featured ? "Featured" : "Standard",
});

export default function ProductsPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const canWrite = can(ARN_MODULES.products, ARN_ACTIONS.write);
  const { data, isLoading } = products.useList();
  const collectionList = collections.useList();
  const createProduct = products.useCreate();
  const updateProduct = products.useUpdate();
  const removeProduct = products.useRemove();

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const collectionOptions = (collectionList.data ?? []).map((c) => ({
    label: c.name,
    value: c.slug,
  }));

  const onSubmit = (values: ProductForm) => {
    const input = {
      ...values,
      badge: values.badge ? values.badge : null,
      featured: values.featured === "Featured",
    };
    const onDone = (msg: string) => {
      toast.success(msg);
      setEditing(null);
      setCreating(false);
    };
    if (editing) {
      updateProduct.mutate(
        { id: editing.id, input },
        { onSuccess: () => onDone("Product updated"), onError: () => toast.error("Update failed") },
      );
    } else {
      createProduct.mutate(input, {
        onSuccess: () => onDone("Product created"),
        onError: () => toast.error("Create failed"),
      });
    }
  };

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setImportResult(await productImport.upload(file));
      qc.invalidateQueries({ queryKey: products.keys.all });
      toast.success("Import complete");
    } catch {
      toast.error("Import failed");
    } finally {
      setUploading(false);
    }
  };

  const formFieldConfig = {
    description: { type: "textarea" as const },
    price: { label: `Price (${CURRENCY.code})`, type: "number" as const },
    collectionSlug: { type: "select" as const, options: collectionOptions },
    featured: {
      type: "select" as const,
      options: [
        { label: "Featured", value: "Featured" },
        { label: "Standard", value: "Standard" },
      ],
    },
    images: { placeholder: "Paste an image URL, press Enter" },
    finishes: { placeholder: "#000000, press Enter" },
    colors: { placeholder: "#000000, press Enter" },
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {canWrite ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => productImport.downloadTemplate()}>
              <Download className="size-4" /> {PRODUCT_COPY.downloadTemplate}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setImportResult(null); setImportOpen(true); }}>
              <Upload className="size-4" /> {PRODUCT_COPY.importProducts}
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {PRODUCT_COPY.newProduct}
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted size-9 overflow-hidden rounded-md">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="size-full object-cover" />
                        ) : null}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.series}</TableCell>
                  <TableCell className="text-muted-foreground">{product.collectionSlug}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="space-x-1">
                    {product.featured ? <Badge>Featured</Badge> : null}
                    {product.badge ? <Badge variant="outline">{product.badge}</Badge> : null}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(product)}>
                      <Pencil className="size-4" />
                    </Button>
                    {canWrite ? (
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(product)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={editing !== null || creating}
        onOpenChange={(open) => { if (!open) { setEditing(null); setCreating(false); } }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? PRODUCT_COPY.editProduct : PRODUCT_COPY.newProduct}</DialogTitle>
            <DialogDescription>{editing?.name ?? "Add a new product to the catalogue."}</DialogDescription>
          </DialogHeader>
          <AutoForm
            key={editing?.id ?? "new"}
            schema={productSchema}
            onSubmit={onSubmit}
            submitText={editing ? PRODUCT_COPY.save : PRODUCT_COPY.create}
            defaultValues={editing ? toForm(editing) : { currency: CURRENCY.code, featured: "Standard" }}
            fieldConfig={formFieldConfig}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{PRODUCT_COPY.deleteTitle}</DialogTitle>
            <DialogDescription>{PRODUCT_COPY.deleteConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>{PRODUCT_COPY.cancel}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleting) return;
                removeProduct.mutate(deleting.id, {
                  onSuccess: () => { toast.success("Product deleted"); setDeleting(null); },
                  onError: () => toast.error("Delete failed"),
                });
              }}
            >
              {PRODUCT_COPY.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{PRODUCT_COPY.importTitle}</DialogTitle>
            <DialogDescription>{PRODUCT_COPY.importHint}</DialogDescription>
          </DialogHeader>
          <Input ref={fileRef} type="file" accept=".xlsx" />
          <Button onClick={onUpload} disabled={uploading}>{PRODUCT_COPY.uploadCta}</Button>
          {importResult ? (
            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <Badge>{importResult.summary.created} created</Badge>
                <Badge variant="outline">{importResult.summary.updated} updated</Badge>
                <Badge variant="destructive">{importResult.summary.errors} errors</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.results.map((r) => (
                    <TableRow key={r.row}>
                      <TableCell>{r.row}</TableCell>
                      <TableCell>{r.slug ?? "—"}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell className="text-muted-foreground">{r.message ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
