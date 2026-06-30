import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import { Separator } from "@ui/components/ui/separator";
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
  DialogFooter,
} from "@ui/components/ui/dialog";
import {
  ORDER_STATUS_TABS,
  ORDER_STATUS_VARIANT,
  ORDER_TRANSITIONS,
  ORDER_ACTION_LABEL,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VARIANT,
} from "../constants/app";
import { formatCurrency, formatDateTime } from "../lib/format";
import { orders } from "../lib/resources";
import type { Order } from "../types/domain";

export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = orders.useList(status ? { status } : undefined);
  const updateOrder = orders.useUpdate();
  const [selected, setSelected] = useState<Order | null>(null);

  const list = data ?? [];

  const advance = (order: Order, next: string) => {
    updateOrder.mutate(
      { id: order.id, input: { status: next } },
      {
        onSuccess: () => {
          toast.success(`Order marked ${next}`);
          setSelected(null);
        },
        onError: () => toast.error("Failed to update order"),
      },
    );
  };

  const itemCount = (order: Order) =>
    (order.items ?? []).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-4">
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {ORDER_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value || "all"} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No orders in this view.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <TableCell>
                      <div className="font-medium">{order.customerName ?? "Guest"}</div>
                      <div className="text-muted-foreground text-xs">
                        {order.customerEmail ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{itemCount(order)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? "secondary"}>
                          {order.status}
                        </Badge>
                        {order.paymentStatus === PAYMENT_STATUS.Paid ? (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                            Paid
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.customerName ?? "Guest"}
                  <Badge variant={ORDER_STATUS_VARIANT[selected.status] ?? "secondary"}>
                    {selected.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selected.customerEmail ?? "—"} · {formatDateTime(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {(selected.items ?? []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name}{" "}
                      <span className="text-muted-foreground">× {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(selected.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="flex items-center gap-2">
                    <Badge
                      variant={
                        PAYMENT_STATUS_VARIANT[selected.paymentStatus ?? PAYMENT_STATUS.Unpaid] ??
                        "secondary"
                      }
                    >
                      {selected.paymentStatus ?? PAYMENT_STATUS.Unpaid}
                    </Badge>
                    {selected.paymentMethod ? (
                      <span className="text-muted-foreground text-xs">
                        {selected.paymentMethod}
                      </span>
                    ) : null}
                  </span>
                </div>
                {selected.paymentId ? (
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Payment ID</span>
                    <span className="font-mono">{selected.paymentId}</span>
                  </div>
                ) : null}
              </div>

              <DialogFooter>
                {(ORDER_TRANSITIONS[selected.status] ?? []).length === 0 ? (
                  <span className="text-muted-foreground text-sm">
                    No further actions for {selected.status.toLowerCase()} orders.
                  </span>
                ) : (
                  (ORDER_TRANSITIONS[selected.status] ?? []).map((next) => (
                    <Button
                      key={next}
                      variant={next === ORDER_STATUS.Cancelled ? "destructive" : "default"}
                      disabled={updateOrder.isPending}
                      onClick={() => advance(selected, next)}
                    >
                      {ORDER_ACTION_LABEL[next] ?? next}
                    </Button>
                  ))
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
