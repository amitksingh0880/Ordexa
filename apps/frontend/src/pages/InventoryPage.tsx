import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { STOCK, type BadgeVariant } from "@/constants/app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function stockBadge(available: number): { label: string; variant: BadgeVariant } {
  if (available <= 0) return { label: STOCK.labels.out, variant: STOCK.variants.out };
  if (available <= STOCK.lowThreshold) return { label: STOCK.labels.low, variant: STOCK.variants.low };
  return { label: STOCK.labels.inStock, variant: STOCK.variants.inStock };
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
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>Live stock levels — available and reserved units per SKU.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const badge = stockBadge(item.available);
                return (
                  <TableRow key={item.sku}>
                    <TableCell className="font-mono">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.available}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.reserved}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
