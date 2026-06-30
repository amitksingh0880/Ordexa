import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Boxes, PackageCheck, Layers, Plus } from "lucide-react";

import { getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { APP, ROUTES } from "@/constants/app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    getInventory()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  const totalSkus = items?.length ?? 0;
  const totalAvailable = items?.reduce((sum, i) => sum + i.available, 0) ?? 0;
  const totalReserved = items?.reduce((sum, i) => sum + i.reserved, 0) ?? 0;

  const stats = [
    { label: "SKUs", value: totalSkus, icon: Layers },
    { label: "Available units", value: totalAvailable, icon: Boxes },
    { label: "Reserved units", value: totalReserved, icon: PackageCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{APP.name}</h1>
          <p className="text-muted-foreground">{APP.tagline}</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.createOrder}>
            <Plus />
            New Order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <stat.icon className="size-4" />
                {stat.label}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {items === null ? <Skeleton className="h-8 w-16" /> : stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Create an order to reserve stock, then watch inventory update.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to={ROUTES.createOrder}>Create an order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.inventory}>View inventory</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
