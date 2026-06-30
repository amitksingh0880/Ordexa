import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Boxes, PackageCheck, Layers, Plus, TrendingUp, DollarSign, ShoppingBag, ArrowUpRight } from "lucide-react";

import { getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { APP, ROUTES, CURRENCY } from "@/constants/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import { Badge } from "@ui/components/ui/badge";

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

  // Catalog value: available units valued at each item's own price.
  const totalValue = items?.reduce((sum, i) => sum + i.available * i.price, 0) ?? 0;

  const formattedTotalValue = new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(totalValue);

  const stats = [
    { 
      label: "Inventory Value", 
      value: items === null ? null : formattedTotalValue, 
      icon: DollarSign,
      description: "Asset value in warehouse",
      trend: "+12.5% vs last month",
      color: "text-emerald-500 bg-emerald-500/10"
    },
    { 
      label: "Active Product SKUs", 
      value: items === null ? null : totalSkus, 
      icon: Layers,
      description: "Unique items in catalog",
      trend: "All active",
      color: "text-blue-500 bg-blue-500/10"
    },
    { 
      label: "Available Stock Units", 
      value: items === null ? null : totalAvailable, 
      icon: Boxes,
      description: "Ready for distribution",
      trend: totalAvailable < 50 ? "Restock needed" : "Healthy levels",
      color: "text-amber-500 bg-amber-500/10"
    },
    { 
      label: "Reserved Inventory", 
      value: items === null ? null : totalReserved, 
      icon: PackageCheck,
      description: "Committed to active sagas",
      trend: `${totalReserved} active holds`,
      color: "text-indigo-500 bg-indigo-500/10"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-card to-background p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary font-semibold">
            System Dashboard
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{APP.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{APP.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="shadow-sm">
            <Link to={ROUTES.inventory}>
              Manage Stock
            </Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link to={ROUTES.createOrder} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {stat.value === null ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-foreground/80">{stat.trend}</span>
                <span>•</span>
                <span>{stat.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Actions & Quickstarts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Operational Flow
            </CardTitle>
            <CardDescription>
              Launch key workflows to verify saga consistency and outbox processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-accent/20">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">Create Reservation Sagas</h4>
                <p className="text-xs text-muted-foreground">
                  Triggers outbox pattern events, runs dual-write check, and updates stock.
                </p>
              </div>
              <Button size="sm" asChild variant="ghost" className="h-8 px-2">
                <Link to={ROUTES.createOrder}>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-accent/20">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5">
                <Boxes className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">Inspect Catalog Levels</h4>
                <p className="text-xs text-muted-foreground">
                  Check available vs reserved levels directly stored in MongoDB Atlas collections.
                </p>
              </div>
              <Button size="sm" asChild variant="ghost" className="h-8 px-2">
                <Link to={ROUTES.inventory}>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-br from-card to-accent/20 border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">Database Configuration</CardTitle>
            <CardDescription>
              Details about your active system environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <span className="text-xs text-muted-foreground block">Active Database</span>
                <span className="font-semibold text-foreground mt-0.5 block">MongoDB Atlas</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <span className="text-xs text-muted-foreground block">Saga Engine</span>
                <span className="font-semibold text-foreground mt-0.5 block">Temporal Server</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/40 col-span-2">
                <span className="text-xs text-muted-foreground block">Prisma Connection Mode</span>
                <span className="font-semibold text-foreground mt-0.5 block font-mono text-xs">relationMode = "prisma"</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
