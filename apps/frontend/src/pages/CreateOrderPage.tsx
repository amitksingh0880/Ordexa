import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { RefreshCw, Loader2 } from "lucide-react";

import { createOrder, getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { ORDER_DEFAULTS } from "@/constants/app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateOrderPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const form = useForm({
    defaultValues: {
      userId: uuidv4(),
      sku: "",
      quantity: String(ORDER_DEFAULTS.quantity),
      totalAmount: "",
      description: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const res = await createOrder({
          userId: value.userId,
          sku: value.sku,
          quantity: Number.parseInt(value.quantity, 10),
          totalAmount: Number.parseFloat(value.totalAmount),
          description: value.description || undefined,
        });
        toast.success(
          `Order ${res.status ?? "created"} — #${res.orderId?.slice(0, 8) ?? ""}`,
        );
        formApi.reset();
        formApi.setFieldValue("userId", uuidv4());
        if (items[0]) formApi.setFieldValue("sku", items[0].sku);
      } catch (err) {
        const msg = isAxiosError(err)
          ? (err.response?.data?.errorMessage ?? err.message)
          : "Failed to create order";
        toast.error(msg);
      }
    },
  });

  useEffect(() => {
    getInventory()
      .then((r) => {
        setItems(r.items);
        if (r.items[0]) form.setFieldValue("sku", r.items[0].sku);
      })
      .catch(() => toast.error("Failed to load inventory"));
    // form identity is stable for the component lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Order</CardTitle>
          <CardDescription>
            Reserves stock for the selected product. Out-of-stock items are disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <form.Field
                name="userId"
                children={(field) => (
                  <div className="flex gap-2">
                    <Input id="userId" value={field.state.value} readOnly className="bg-muted" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => field.handleChange(uuidv4())}
                      aria-label="Regenerate user ID"
                    >
                      <RefreshCw />
                    </Button>
                  </div>
                )}
              />
            </div>

            {/* Product (SKU) */}
            <div className="space-y-2">
              <Label htmlFor="sku">Product</Label>
              <form.Field
                name="sku"
                children={(field) => (
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger id="sku" className="w-full">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.sku} value={item.sku} disabled={item.available <= 0}>
                          {item.name} · {item.sku} ({item.available} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Quantity + Total */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <form.Field
                  name="quantity"
                  children={(field) => (
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <form.Field
                  name="totalAmount"
                  children={(field) => (
                    <Input
                      id="totalAmount"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <form.Field
                name="description"
                children={(field) => (
                  <Textarea
                    id="description"
                    placeholder="Optional notes"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </div>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  {isSubmitting ? "Placing order…" : "Create Order"}
                </Button>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
