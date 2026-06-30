import { Link } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import { DollarSign, ShoppingBag, Boxes, Star, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Skeleton } from "@ui/components/ui/skeleton";
import { Button } from "@ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import { ChartContainer, type ChartConfig } from "@ui/components/ui/chart";
import {
  ROUTES,
  ORDER_STATUS,
  ORDER_STATUS_TABS,
  ORDER_STATUS_VARIANT,
  REVIEW_STATUS,
  MESSAGE_STATUS,
  STOCK,
} from "../constants/app";
import { formatCurrency, formatDateTime } from "../lib/format";
import { orders, inventory, products, reviews, messages } from "../lib/resources";

const REVENUE_STATUSES: string[] = [
  ORDER_STATUS.Confirmed,
  ORDER_STATUS.Shipped,
  ORDER_STATUS.Delivered,
];

const STATUS_COLOR: Record<string, string> = {
  [ORDER_STATUS.Pending]: "#f59e0b",
  [ORDER_STATUS.Confirmed]: "#3b82f6",
  [ORDER_STATUS.Shipped]: "#6366f1",
  [ORDER_STATUS.Delivered]: "#10b981",
  [ORDER_STATUS.Cancelled]: "#ef4444",
};

const chartConfig: ChartConfig = { count: { label: "Orders" } };

export default function DashboardPage() {
  const ordersQuery = orders.useList();
  const inventoryQuery = inventory.useList();
  const productsQuery = products.useList();
  const pendingReviews = reviews.useList({ status: REVIEW_STATUS.Pending });
  const unreadMessages = messages.useList({ status: MESSAGE_STATUS.Unread });

  const orderList = ordersQuery.data ?? [];
  const inventoryList = inventoryQuery.data ?? [];

  const revenue = orderList
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orderList.filter((o) => o.status === ORDER_STATUS.Pending).length;
  const lowStock = inventoryList.filter((i) => i.available <= STOCK.lowThreshold).length;

  const chartData = ORDER_STATUS_TABS.filter((t) => t.value).map((t) => ({
    status: t.label,
    count: orderList.filter((o) => o.status === t.value).length,
    color: STATUS_COLOR[t.value] ?? "#64748b",
  }));

  const stats = [
    {
      label: "Revenue",
      value: ordersQuery.isLoading ? null : formatCurrency(revenue),
      icon: DollarSign,
      hint: "Confirmed, shipped & delivered",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Total Orders",
      value: ordersQuery.isLoading ? null : orderList.length,
      icon: ShoppingBag,
      hint: `${pendingCount} awaiting action`,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Low Stock SKUs",
      value: inventoryQuery.isLoading ? null : lowStock,
      icon: Boxes,
      hint: `of ${inventoryList.length} items`,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Products",
      value: productsQuery.isLoading ? null : (productsQuery.data?.length ?? 0),
      icon: ShoppingBag,
      hint: "Active catalog",
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      label: "Pending Reviews",
      value: pendingReviews.isLoading ? null : (pendingReviews.data?.length ?? 0),
      icon: Star,
      hint: "Awaiting moderation",
      color: "text-yellow-500 bg-yellow-500/10",
    },
    {
      label: "Unread Messages",
      value: unreadMessages.isLoading ? null : (unreadMessages.data?.length ?? 0),
      icon: Mail,
      hint: "Customer enquiries",
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  const recentOrders = [...orderList].slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground text-xs font-medium">{stat.label}</span>
              <div className={`rounded-md p-1.5 ${stat.color}`}>
                <stat.icon className="size-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {stat.value === null ? <Skeleton className="h-7 w-16" /> : stat.value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
            <CardDescription>Current distribution across the pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[240px]">
              <BarChart data={chartData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.status} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Latest activity from the storefront</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.orders}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        {o.customerName ?? "Guest"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ORDER_STATUS_VARIANT[o.status] ?? "secondary"}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs">
                        {formatDateTime(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
