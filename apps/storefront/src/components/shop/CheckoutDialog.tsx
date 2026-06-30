import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { Button } from "@ui/components/ui/button";
import { AutoForm } from "@ui/components/ui/auto-form";
import { SHOP, formatPrice } from "../../constants/shop";
import { ROUTES, CHECKOUT_COPY, ADDRESS_FIELDS } from "../../constants/app";
import { addressSchema, type AddressValues } from "../../lib/schemas";
import { paymentsApi } from "../../lib/payments";
import { openRazorpayCheckout, makePaymentId } from "../../lib/razorpay";
import { addresses } from "../../lib/resources";
import { useCart } from "../../context/cart-context";
import { useAuth } from "../../context/auth-context";

export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { cartId, subtotal, clear, setOpen: setCartOpen } = useCart();
  const navigate = useNavigate();

  const config = useQuery({ queryKey: ["payments-config"], queryFn: paymentsApi.getConfig });
  const savedAddresses = addresses.useList(undefined, { enabled: Boolean(user) });

  const methods = config.data?.shipping.methods ?? [];
  const [methodId, setMethodId] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const activeMethod = methods.find((m) => m.id === methodId) ?? methods[0];
  const freeThreshold = config.data?.shipping.freeThreshold ?? Infinity;
  const shippingCost = activeMethod
    ? subtotal >= freeThreshold
      ? 0
      : activeMethod.cost
    : 0;
  const total = subtotal + shippingCost;

  const defaultAddress = savedAddresses.data?.find((a) => a.isDefault) ?? savedAddresses.data?.[0];
  const addressDefaults: Partial<AddressValues> | undefined = defaultAddress
    ? {
        label: defaultAddress.label ?? "",
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        line1: defaultAddress.line1,
        line2: defaultAddress.line2 ?? "",
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      }
    : undefined;

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) setProcessing(false);
  };

  const finish = () => {
    toast.success(SHOP.payment.success);
    clear();
    close(false);
    setCartOpen(false);
    navigate({ to: ROUTES.account });
  };

  const placeOrder = async (address: AddressValues) => {
    if (!user) return;
    setProcessing(true);
    try {
      const created = await paymentsApi.createOrder({
        cartId,
        shippingMethodId: activeMethod?.id ?? "",
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        customerName: user.name,
        customerEmail: user.email,
      });

      if (created.mock || !created.keyId) {
        await paymentsApi.verify({
          orderId: created.orderId,
          razorpayOrderId: created.razorpayOrderId,
          razorpayPaymentId: makePaymentId(),
        });
      } else {
        const result = await openRazorpayCheckout({
          keyId: created.keyId,
          razorpayOrderId: created.razorpayOrderId,
          amount: created.amount,
          currency: created.currency,
          name: user.name,
          email: user.email,
        });
        await paymentsApi.verify({
          orderId: created.orderId,
          razorpayOrderId: result.orderId,
          razorpayPaymentId: result.paymentId,
          signature: result.signature,
        });
      }
      finish();
    } catch {
      toast.error(SHOP.payment.failed);
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-surface">
        {!user ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-h2 tracking-tight text-ink">
                {CHECKOUT_COPY.signInRequired}
              </DialogTitle>
              <DialogDescription className="font-body text-ink-soft">
                {CHECKOUT_COPY.signInPrompt}
              </DialogDescription>
            </DialogHeader>
            <Button asChild className="rounded-none bg-ink py-6 text-white hover:bg-ink/80">
              <Link to={ROUTES.login} onClick={() => close(false)}>
                {CHECKOUT_COPY.signInRequired}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-h2 tracking-tight text-ink">
                {CHECKOUT_COPY.addressStep}
              </DialogTitle>
              <DialogDescription className="font-body text-ink-soft">
                {SHOP.payment.detailsSubtitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <span className="font-body text-label uppercase tracking-[0.15em] text-ink-muted">
                {CHECKOUT_COPY.deliveryMethod}
              </span>
              <Select value={activeMethod?.id ?? ""} onValueChange={setMethodId}>
                <SelectTrigger className="w-full rounded-none border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label} · {m.cost === 0 ? CHECKOUT_COPY.free : formatPrice(m.cost)} · {m.etaDays}d
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 border-y border-line py-3 font-body text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>{CHECKOUT_COPY.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>{CHECKOUT_COPY.shipping}</span>
                <span>{shippingCost === 0 ? CHECKOUT_COPY.free : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-display text-base font-bold text-ink">
                <span>{CHECKOUT_COPY.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {processing ? (
              <div className="flex items-center justify-center gap-2 py-6 text-ink-soft">
                <Loader2 className="size-4 animate-spin" />
                {SHOP.payment.processing}
              </div>
            ) : (
              <AutoForm
                key={defaultAddress?.id ?? "new-address"}
                schema={addressSchema}
                onSubmit={placeOrder}
                defaultValues={addressDefaults}
                submitText={`${SHOP.payment.payCta} ${formatPrice(total)}`}
                fieldConfig={{
                  label: { label: ADDRESS_FIELDS.label },
                  fullName: { label: ADDRESS_FIELDS.fullName },
                  phone: { label: ADDRESS_FIELDS.phone },
                  line1: { label: ADDRESS_FIELDS.line1 },
                  line2: { label: ADDRESS_FIELDS.line2 },
                  city: { label: ADDRESS_FIELDS.city },
                  state: { label: ADDRESS_FIELDS.state },
                  postalCode: { label: ADDRESS_FIELDS.postalCode },
                  country: { label: ADDRESS_FIELDS.country },
                }}
              />
            )}

            <div className="flex items-center justify-center gap-1.5 font-body text-[11px] text-ink-muted">
              <ShieldCheck className="size-3.5" />
              {SHOP.payment.securedNote}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
