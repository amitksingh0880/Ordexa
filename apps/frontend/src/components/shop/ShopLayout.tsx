import { Outlet } from "@tanstack/react-router";
import { CartProvider } from "../../context/cart-context";
import { ShopHeader } from "./ShopHeader";
import { ShopFooter } from "./ShopFooter";
import { CartSheet } from "./CartSheet";

export function ShopLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-page font-body text-ink">
        <ShopHeader />
        <main className="flex-1 pt-20">
          <Outlet />
        </main>
        <ShopFooter />
        <CartSheet />
      </div>
    </CartProvider>
  );
}
