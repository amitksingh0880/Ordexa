import { useEffect, useState } from "react";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { RefreshCw, ShoppingBag, Truck, Info, CreditCard, ShieldCheck } from "lucide-react";

import { createOrder, getInventory } from "@/lib/api-client";
import type { InventoryItem } from "@/types/domain";
import { ORDER_DEFAULTS, PRODUCT_PRICES, CURRENCY } from "@/constants/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@ui/components/ui/card";
import { Button } from "@ui/components/ui/button";
import { AutoForm, type FieldConfig } from "@ui/components/ui/auto-form";
import { Badge } from "@ui/components/ui/badge";
import { Separator } from "@ui/components/ui/separator";

// Schema for validating the order form
const orderSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
  sku: z.string().min(1, "Please select a product"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  totalAmount: z.number().min(0, "Amount cannot be negative"),
  description: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function CreateOrderPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [formValues, setFormValues] = useState<Partial<OrderFormValues>>({
    userId: uuidv4(),
    sku: "",
    quantity: ORDER_DEFAULTS.quantity,
    totalAmount: 0,
    description: "",
  });

  const selectedItem = items.find((i) => i.sku === formValues.sku);
  const unitPrice = formValues.sku ? (PRODUCT_PRICES[formValues.sku] ?? 0) : 0;
  const calculatedTotal = unitPrice * (formValues.quantity ?? 1);

  // Sync calculation updates to the form values
  useEffect(() => {
    if (formValues.sku) {
      setFormValues((prev) => {
        if (prev.totalAmount !== calculatedTotal) {
          return { ...prev, totalAmount: calculatedTotal };
        }
        return prev;
      });
    }
  }, [formValues.sku, formValues.quantity, calculatedTotal]);

  useEffect(() => {
    getInventory()
      .then((r) => {
        setItems(r.items);
        const firstAvailable = r.items.find((item) => item.available > 0);
        if (firstAvailable) {
          setFormValues((prev) => ({
            ...prev,
            sku: firstAvailable.sku,
            totalAmount: (PRODUCT_PRICES[firstAvailable.sku] ?? 0) * (prev.quantity ?? 1),
          }));
        }
      })
      .catch(() => toast.error("Failed to load inventory"));
  }, []);

  const handleValuesChange = (newValues: OrderFormValues) => {
    setFormValues(newValues);
  };

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      const res = await createOrder({
        userId: values.userId,
        sku: values.sku,
        quantity: values.quantity,
        totalAmount: values.totalAmount,
        description: values.description || undefined,
      });

      toast.success(
        `Order ${res.status ?? "created"} — #${res.orderId?.slice(0, 8) ?? ""}`
      );

      // Reset form on success
      const newUserId = uuidv4();
      const firstAvailable = items.find((item) => item.available > 0);
      
      setFormValues({
        userId: newUserId,
        sku: firstAvailable?.sku || "",
        quantity: ORDER_DEFAULTS.quantity,
        totalAmount: firstAvailable ? (PRODUCT_PRICES[firstAvailable.sku] ?? 0) * ORDER_DEFAULTS.quantity : 0,
        description: "",
      });
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.errorMessage ?? err.message)
        : "Failed to create order";
      toast.error(msg);
    }
  };

  // Configure form fields
  const fieldConfig: Record<keyof OrderFormValues, FieldConfig> = {
    userId: {
      label: "User Session ID",
      readOnly: true,
      className: "col-span-2",
      placeholder: "Loading session user...",
      renderRightElement: (_, onChange) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(uuidv4())}
          aria-label="Regenerate user ID"
          className="ml-2 hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </Button>
      ),
    },
    sku: {
      label: "Product / Item",
      type: "select",
      placeholder: "Choose an item from catalog",
      options: items.map((item) => ({
        label: `${item.name} (${item.available} in stock)`,
        value: item.sku,
        disabled: item.available <= 0,
      })),
    },
    quantity: {
      label: "Quantity",
      type: "number",
      placeholder: "Enter quantity",
    },
    totalAmount: {
      label: "Estimated Total Price",
      type: "number",
      readOnly: true,
      placeholder: "0.00",
    },
    description: {
      label: "Additional Notes (Optional)",
      type: "textarea",
      placeholder: "Provide delivery addresses, notes, or special instructions...",
    },
  };

  const formattedTotal = new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(calculatedTotal);

  const formattedUnitPrice = new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(unitPrice);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Checkout Catalog
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete your purchase reservation. Stock is dynamically validated in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Dynamic AutoForm */}
        <div className="lg:col-span-7">
          <Card className="shadow-xl border-border bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Billing Details</CardTitle>
              <CardDescription>
                Fill out the required information to reserve your order from our distribution center.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoForm
                schema={orderSchema}
                onSubmit={handleSubmit}
                fieldConfig={fieldConfig}
                values={formValues}
                onValuesChange={handleValuesChange}
                submitText="Place Reservation Order"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Modern E-Commerce Checkout / Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-card to-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Order Summary</span>
                {selectedItem && (
                  <Badge variant={selectedItem.available > 10 ? "default" : "secondary"}>
                    {selectedItem.available > 10 ? "Available" : "Limited Stock"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Review item breakdown and pricing details.</CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Product Info */}
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{selectedItem.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono mt-0.5">{selectedItem.sku}</p>
                    </div>
                    <span className="font-bold text-lg text-foreground">{formattedUnitPrice}</span>
                  </div>

                  <div className="bg-accent/40 rounded-xl p-4 flex items-center gap-3 border border-border/40 text-sm">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-medium">Stock Status: </span>
                      {selectedItem.available} units available in warehouse.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Please select a product from the list to view pricing breakdown.</p>
                </div>
              )}

              <Separator />

              {/* Cost Calculations */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4" /> Shipping
                  </span>
                  <span className="text-emerald-500 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹0.00</span>
                </div>
              </div>

              <Separator />

              {/* Grand Total */}
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-bold text-lg">Total Amount</span>
                  <p className="text-xs text-muted-foreground mt-0.5">VAT & Import duties included</p>
                </div>
                <span className="text-3xl font-extrabold text-primary tracking-tight">{formattedTotal}</span>
              </div>
            </CardContent>

            <CardFooter className="bg-accent/20 border-t border-border/50 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Secure reservation pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Powered by Ordexa Saga Transaction Engine</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
