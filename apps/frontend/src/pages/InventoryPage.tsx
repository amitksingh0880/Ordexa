import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package, ShieldAlert, Boxes, Coins, CircleCheck } from "lucide-react";

import { getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { STOCK, type BadgeVariant } from "@/constants/app";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table";
import { Badge } from "@ui/components/ui/badge";
import { Skeleton } from "@ui/components/ui/skeleton";

function stockBadge(available: number): { label: string; variant: BadgeVariant; icon: React.ReactNode } {
  if (available <= 0) {
    return { 
      label: STOCK.labels.out, 
      variant: STOCK.variants.out,
      icon: <ShieldAlert className="h-3 w-3 mr-1" />
    };
  }
  if (available <= STOCK.lowThreshold) {
    return { 
      label: STOCK.labels.low, 
      variant: STOCK.variants.low,
      icon: <Boxes className="h-3 w-3 mr-1" />
    };
  }
  return { 
    label: STOCK.labels.inStock, 
    variant: STOCK.variants.inStock,
    icon: <CircleCheck className="h-3 w-3 mr-1" />
  };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventory()
      .then((res) => setItems(res.items))
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Package className="h-8 w-8 text-primary" />
          Warehouse & Catalog Stock
        </h1>
        <p className="text-muted-foreground text-base">
          Real-time tracking of product pricing, availability, and active reserved locks.
        </p>
      </div>

      <Card className="shadow-lg border-border bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Active Inventory Items</CardTitle>
          <CardDescription>
            Verify stock levels and reservation states in the primary collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="font-semibold text-right">Unit Price</TableHead>
                    <TableHead className="font-semibold text-right">Available Stock</TableHead>
                    <TableHead className="font-semibold text-right">Reserved Holds</TableHead>
                    <TableHead className="font-semibold pl-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const badge = stockBadge(item.available);
                    return (
                      <TableRow key={item.sku} className="hover:bg-accent/30 transition-colors">
                        <TableCell className="font-mono text-sm text-foreground/80">{item.sku}</TableCell>
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground flex items-center justify-end gap-1.5 h-12">
                          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">{item.available}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{item.reserved}</TableCell>
                        <TableCell className="pl-6">
                          <Badge variant={badge.variant} className="flex items-center w-fit shadow-sm">
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
