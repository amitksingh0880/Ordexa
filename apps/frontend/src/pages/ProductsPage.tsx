import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/components/ui/dialog";
import { AutoForm } from "@ui/components/ui/auto-form";
import { formatCurrency } from "../lib/format";
import { products } from "../lib/resources";
import type { Product } from "../types/domain";

const productSchema = z.object({
  price: z.number().min(0, "Price must be positive"),
  badge: z.string().optional(),
  featured: z.enum(["Featured", "Standard"]),
});

export default function ProductsPage() {
  const { data, isLoading } = products.useList();
  const updateProduct = products.useUpdate();
  const [editing, setEditing] = useState<Product | null>(null);

  const handleSubmit = (values: z.infer<typeof productSchema>) => {
    if (!editing) return;
    updateProduct.mutate(
      {
        id: editing.id,
        input: {
          price: values.price,
          badge: values.badge ? values.badge : null,
          featured: values.featured === "Featured",
        },
      },
      {
        onSuccess: () => {
          toast.success("Product updated");
          setEditing(null);
        },
        onError: () => toast.error("Failed to update product"),
      },
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
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
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.series}</TableCell>
                  <TableCell className="text-muted-foreground">{product.collectionSlug}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="space-x-1">
                    {product.featured ? <Badge>Featured</Badge> : null}
                    {product.badge ? <Badge variant="outline">{product.badge}</Badge> : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(product)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          {editing ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit {editing.name}</DialogTitle>
                <DialogDescription>
                  Update pricing and merchandising flags for this product.
                </DialogDescription>
              </DialogHeader>
              <AutoForm
                schema={productSchema}
                onSubmit={handleSubmit}
                submitText="Save Product"
                defaultValues={{
                  price: editing.price,
                  badge: editing.badge ?? "",
                  featured: editing.featured ? "Featured" : "Standard",
                }}
                fieldConfig={{
                  price: { label: "Price (USD)", type: "number" },
                  badge: { label: "Badge", placeholder: "e.g. New / Limited Edition" },
                  featured: {
                    label: "Featured",
                    type: "select",
                    options: [
                      { label: "Featured", value: "Featured" },
                      { label: "Standard", value: "Standard" },
                    ],
                  },
                }}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
