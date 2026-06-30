import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PackageOpen } from "lucide-react";

import { getOrdersByUser } from "@/lib/api-client";
import type { Order } from "@/types/domain";
import { ORDER_STATUS_VARIANT } from "@/constants/app";
import { formatCurrency, formatDateTime } from "@/lib/format";
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

type UserOrdersPageProps = {
  userId: string;
};

export default function UserOrdersPage({ userId }: UserOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrdersByUser(userId)
      .then((res) => {
        if (active) setOrders(res.orders);
      })
      .catch(() => toast.error("Failed to fetch orders"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription className="font-mono break-all">User {userId}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-12">
            <PackageOpen className="size-8" />
            <p>No orders found for this user.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono">{order.orderId.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? "outline"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
