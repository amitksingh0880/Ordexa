import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "../constants/app";
import { cart } from "../lib/resources";
import { authApi } from "../lib/auth";
import { useAuth } from "./auth-context";
import type { CartItem, Product } from "../types/shop";

interface CartContextValue {
  lines: CartItem[];
  cartId: string;
  count: number;
  subtotal: number;
  isLoading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, finish: string, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function resolveCartId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.cartId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.cartId, id);
  }
  return id;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [guestId] = useState(resolveCartId);
  const [open, setOpen] = useState(false);

  // Logged-in shoppers carry their cart under their user id; guests use the
  // local cartId. The guest bag is merged once on the first authenticated load.
  const cartId = user?.id ?? guestId;
  const mergedRef = useRef(false);

  useEffect(() => {
    if (user && !mergedRef.current && guestId !== user.id) {
      mergedRef.current = true;
      authApi
        .mergeCart(guestId)
        .then(() => qc.invalidateQueries({ queryKey: cart.keys.all }));
    }
  }, [user, guestId, qc]);

  const { data: lines = [], isLoading } = cart.useList({ cartId });
  const createItem = cart.useCreate();
  const updateItem = cart.useUpdate();
  const removeItemMutation = cart.useRemove();

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    return {
      lines,
      cartId,
      count,
      subtotal,
      isLoading,
      open,
      setOpen,
      addItem: (product, finish, quantity = 1) => {
        const existing = lines.find(
          (l) => l.productSlug === product.slug && l.finish === finish,
        );
        if (existing) {
          updateItem.mutate({
            id: existing.id,
            input: { quantity: existing.quantity + quantity },
          });
          return;
        }
        createItem.mutate({
          cartId,
          productSlug: product.slug,
          name: product.name,
          series: product.series,
          price: product.price,
          currency: product.currency,
          image: product.images[0],
          finish,
          quantity,
        });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          removeItemMutation.mutate(id);
          return;
        }
        updateItem.mutate({ id, input: { quantity } });
      },
      removeItem: (id) => removeItemMutation.mutate(id),
      clear: () => lines.forEach((l) => removeItemMutation.mutate(l.id)),
    };
  }, [lines, isLoading, open, cartId, createItem, updateItem, removeItemMutation]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
