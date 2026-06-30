import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@ui/components/ui/button";
import { Badge } from "@ui/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/components/ui/sheet";
import { ROUTES, AUTH_COPY } from "../../constants/app";
import { SHOP } from "../../constants/shop";
import { useCart } from "../../context/cart-context";
import { useAuth } from "../../context/auth-context";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {SHOP.nav.map((item, index) => (
        <Link
          key={`${item.label}-${index}`}
          to={item.to}
          onClick={onNavigate}
          className="font-body text-sm tracking-tight text-ink-soft transition-colors hover:text-ink"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function ShopHeader() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 z-40 w-full border-b border-line/20 bg-surface/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1728px] items-center justify-between px-6 md:px-10">
        <Link
          to={ROUTES.shop}
          className="font-display text-h2 font-bold tracking-tighter text-ink"
        >
          {SHOP.brand}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-ink" aria-label="Search">
            <Search className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-ink"
            aria-label="Open shopping bag"
            onClick={() => setOpen(true)}
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px] tabular-nums">
                {count}
              </Badge>
            ) : null}
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-ink"
            aria-label={AUTH_COPY.account}
          >
            <Link to={user ? ROUTES.account : ROUTES.login}>
              <User className="size-5" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-ink md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-page">
              <SheetHeader>
                <SheetTitle className="font-display text-h2 tracking-tighter text-ink">
                  {SHOP.brand}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
