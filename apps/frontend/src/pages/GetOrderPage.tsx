import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PackageOpen, Clock, AlertCircle, Sparkles, ReceiptText } from "lucide-react";

import { getOrdersByUser } from "@/lib/api-client";
import type { Order } from "@/types/domain";
import { ORDER_STATUS_VARIANT, ORDER_STATUS, CURRENCY } from "@/constants/app";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table";
import { Badge } from "@ui/components/ui/badge";
import { Skeleton } from "@ui/components/ui/skeleton";

type UserOrdersPageProps = {
  userId: string;
};

const statusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case ORDER_STATUS.Confirmed:
      return <Sparkles className="h-3 w-3 mr-1" />;
    case ORDER_STATUS.Failed:
      return <AlertCircle className="h-3 w-3 mr-1" />;
    default:
      return <Clock className="h-3 w-3 mr-1" />;
  }
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(CURRENCY.locale, {
      style: "currency",
      currency: CURRENCY.code,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <ReceiptText className="h-8 w-8 text-primary" />
          Customer Order History
        </h1>
        <p className="text-muted-foreground text-base">
          Tracking list of placed orders and saga verification states.
        </p>
      </div>

      <Card className="shadow-lg border-border bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Orders Overview</CardTitle>
          <CardDescription className="font-mono text-sm break-all text-primary/80">
            Profile Identifier: {userId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 border border-dashed border-border rounded-xl bg-accent/10">
              <PackageOpen className="size-12 text-muted-foreground/60 animate-bounce" />
              <div className="text-center space-y-1">
                <h4 className="font-semibold text-foreground">No orders tracked</h4>
                <p className="text-sm">Create a reservation request first to start tracking.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Status State</TableHead>
                    <TableHead className="font-semibold text-right">Charged Price</TableHead>
                    <TableHead className="font-semibold">Description / Notes</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="font-mono text-sm text-primary font-medium">
                        #{order.orderId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? "outline"} className="flex items-center w-fit shadow-sm">
                          {statusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {order.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
