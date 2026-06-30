import { useState } from "react";
import { toast } from "sonner";
import { Check, ShieldAlert, Boxes, CircleCheck } from "lucide-react";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Skeleton } from "@ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import { STOCK, type BadgeVariant } from "../constants/app";
import { inventory } from "../lib/resources";
import type { InventoryItem } from "../types/domain";

function stockBadge(available: number): { label: string; variant: BadgeVariant; icon: typeof Boxes } {
  if (available <= 0) return { label: STOCK.labels.out, variant: STOCK.variants.out, icon: ShieldAlert };
  if (available <= STOCK.lowThreshold)
    return { label: STOCK.labels.low, variant: STOCK.variants.low, icon: Boxes };
  return { label: STOCK.labels.inStock, variant: STOCK.variants.inStock, icon: CircleCheck };
}

function InventoryRow({
  item,
  onSave,
  saving,
}: {
  item: InventoryItem;
  onSave: (id: string, price: number, available: number) => void;
  saving: boolean;
}) {
  const [price, setPrice] = useState(String(item.price));
  const [available, setAvailable] = useState(String(item.available));
  const dirty = price !== String(item.price) || available !== String(item.available);
  const badge = stockBadge(item.available);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-8 w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={available}
          onChange={(e) => setAvailable(e.target.value)}
          className="h-8 w-24"
        />
      </TableCell>
      <TableCell className="text-muted-foreground text-right">{item.reserved}</TableCell>
      <TableCell>
        <Badge variant={badge.variant} className="gap-1">
          <badge.icon className="size-3" />
          {badge.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={dirty ? "default" : "ghost"}
          disabled={!dirty || saving}
          onClick={() => onSave(item.id, Number(price), Number(available))}
        >
          <Check className="size-4" />
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function InventoryPage() {
  const { data, isLoading } = inventory.useList();
  const updateItem = inventory.useUpdate();

  const handleSave = (id: string, price: number, available: number) => {
    updateItem.mutate(
      { id, input: { price, available } },
      {
        onSuccess: () => toast.success("Inventory updated"),
        onError: () => toast.error("Failed to update inventory"),
      },
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  onSave={handleSave}
                  saving={updateItem.isPending}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
