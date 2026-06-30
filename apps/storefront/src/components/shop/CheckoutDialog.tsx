import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/components/ui/dialog";
import { Input } from "@ui/components/ui/input";
import { Button } from "@ui/components/ui/button";
import { SHOP, formatPrice } from "../../constants/shop";
import { checkoutSchema } from "../../lib/schemas";
import {
  RAZORPAY_IS_MOCK,
  makePaymentId,
  openRealRazorpay,
} from "../../lib/razorpay";
import { orders } from "../../lib/resources";
import { useCart } from "../../context/cart-context";

const inputClass =
  "rounded-none border-0 border-b border-line bg-transparent px-0 focus-visible:border-ink focus-visible:ring-0";

type Step = "details" | "pay";

export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cartId, subtotal, lines, clear, setOpen: setCartOpen } = useCart();
  const createOrder = orders.useCreate();

  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setStep("details");
      setProcessing(false);
      setError("");
    }
  };

  const completeOrder = (paymentId: string) => {
    createOrder.mutate(
      {
        userId: cartId,
        status: "Pending",
        paymentStatus: "Paid",
        paymentId,
        paymentMethod: SHOP.payment.method,
        totalAmount: subtotal,
        currency: SHOP.currency.code,
        customerName: form.name,
        customerEmail: form.email,
        items: lines.map((l) => ({
          productSlug: l.productSlug,
          name: l.name,
          price: l.price,
          finish: l.finish,
          quantity: l.quantity,
        })),
      },
      {
        onSuccess: () => {
          toast.success(SHOP.payment.success);
          clear();
          setForm({ name: "", email: "" });
          close(false);
          setCartOpen(false);
        },
        onError: () => {
          toast.error("Order could not be saved after payment.");
          setProcessing(false);
        },
      },
    );
  };

  const onContinue = async () => {
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "");
      return;
    }
    setError("");

    if (RAZORPAY_IS_MOCK) {
      setStep("pay");
      return;
    }

    setProcessing(true);
    try {
      const { paymentId } = await openRealRazorpay({
        amount: subtotal,
        currency: SHOP.currency.code,
        name: form.name,
        email: form.email,
      });
      completeOrder(paymentId);
    } catch {
      toast.error(SHOP.payment.failed);
      setProcessing(false);
    }
  };

  const mockPay = () => {
    setProcessing(true);
    window.setTimeout(() => completeOrder(makePaymentId()), 1300);
  };

  const mockFail = () => {
    toast.error(SHOP.payment.failed);
    setStep("details");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="bg-surface">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-h2 tracking-tight text-ink">
                {SHOP.payment.detailsTitle}
              </DialogTitle>
              <DialogDescription className="font-body text-ink-soft">
                {SHOP.payment.detailsSubtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={SHOP.cart.nameLabel}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
              <Input
                type="email"
                placeholder={SHOP.cart.emailLabel}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
              {error ? <p className="font-body text-xs text-destructive">{error}</p> : null}
              <div className="flex items-center justify-between pt-2">
                <span className="font-display text-h2 font-bold text-ink">
                  {formatPrice(subtotal)}
                </span>
                <Button
                  onClick={onContinue}
                  disabled={processing}
                  className="rounded-none bg-ink px-8 py-6 font-body text-label uppercase tracking-[0.2em] text-white hover:bg-ink/80"
                >
                  {processing ? <Loader2 className="size-4 animate-spin" /> : null}
                  {SHOP.payment.continue}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-h2 tracking-tight text-ink">
                <span className="rounded bg-[#0b3bdc] px-2 py-0.5 text-xs font-bold text-white">
                  Razorpay
                </span>
                {SHOP.payment.payTitle}
              </DialogTitle>
              <DialogDescription className="font-body text-ink-soft">
                {SHOP.payment.company} · {form.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-md border border-line bg-surface-low p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-label uppercase tracking-[0.15em] text-ink-muted">
                  Amount
                </span>
                <span className="font-display text-h2 font-bold text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="font-body text-xs text-ink-muted">{SHOP.payment.testCard}</p>
              <Button
                onClick={mockPay}
                disabled={processing}
                className="w-full rounded-none bg-ink py-6 font-body text-label uppercase tracking-[0.2em] text-white hover:bg-ink/80"
              >
                {processing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {SHOP.payment.processing}
                  </>
                ) : (
                  `${SHOP.payment.payCta} ${formatPrice(subtotal)}`
                )}
              </Button>
              {!processing ? (
                <button
                  type="button"
                  onClick={mockFail}
                  className="w-full font-body text-[11px] uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:underline"
                >
                  {SHOP.payment.simulateFail}
                </button>
              ) : null}
            </div>

            <div className="flex items-center justify-center gap-1.5 font-body text-[11px] text-ink-muted">
              <ShieldCheck className="size-3.5" />
              {SHOP.payment.securedNote} · {SHOP.payment.demoNote}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
