import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@ui/components/ui/sheet";
import { Button } from "@ui/components/ui/button";
import { Separator } from "@ui/components/ui/separator";
import { QuantityStepper } from "./QuantityStepper";
import { ROUTES } from "../../constants/app";
import { SHOP, formatPrice } from "../../constants/shop";
import { useCart } from "../../context/cart-context";

export function CartSheet() {
  const { lines, count, subtotal, open, setOpen, updateQuantity, removeItem, clear } =
    useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-line/30 bg-surface sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-line/20 px-6 py-5">
          <SheetTitle className="font-display text-h2 font-bold tracking-tighter text-ink">
            {SHOP.cart.title} ({count})
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-body text-sm text-ink-soft">{SHOP.cart.empty}</p>
            <SheetClose asChild>
              <Button asChild className="rounded-none bg-ink px-8 text-white hover:bg-ink/80">
                <Link to={ROUTES.shopCollections}>{SHOP.cart.emptyCta}</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex gap-4 border-b border-line/10 py-4"
                >
                  <div className="h-40 w-32 flex-shrink-0 overflow-hidden bg-surface-container">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-body-lg font-bold tracking-tight text-ink">
                          {line.name}
                        </h3>
                        <span className="font-body text-sm font-semibold text-ink">
                          {formatPrice(line.price, line.currency)}
                        </span>
                      </div>
                      <p className="mt-1 font-body text-label uppercase tracking-[0.1em] text-ink-muted">
                        {line.series}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(quantity) => updateQuantity(line.id, quantity)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        className="font-body text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-destructive"
                      >
                        {SHOP.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="gap-4 border-t border-line/20 bg-white/40 px-6 py-6">
              <div className="space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-ink-soft">{SHOP.cart.subtotal}</span>
                  <span className="text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-ink-soft">{SHOP.cart.shipping}</span>
                  <span className="text-ink-soft">{SHOP.cart.shippingValue}</span>
                </div>
                <Separator className="bg-line/30" />
                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-display text-h2 font-bold tracking-tighter text-ink">
                    {SHOP.cart.total}
                  </span>
                  <span className="font-display text-h2 font-bold tracking-tighter text-flare-deep">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full rounded-full bg-ink py-6 font-body text-label uppercase tracking-[0.15em] text-white shadow-lg hover:bg-ink/90"
                onClick={() => {
                  toast.success(SHOP.cart.checkoutSuccess);
                  clear();
                  setOpen(false);
                }}
              >
                {SHOP.cart.checkout}
              </Button>
              <p className="text-center font-body text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                {SHOP.cart.checkoutNote}
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
