import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "../constants/app";
import type { CartLine, Product } from "../types/shop";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, finish: string, quantity?: number) => void;
  updateQuantity: (slug: string, finish: string, quantity: number) => void;
  removeItem: (slug: string, finish: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (line: CartLine, slug: string, finish: string) =>
  line.product.slug === slug && line.finish === finish;

function loadLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

    return {
      lines,
      count,
      subtotal,
      open,
      setOpen,
      addItem: (product, finish, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => sameLine(l, product.slug, finish));
          if (existing) {
            return prev.map((l) =>
              sameLine(l, product.slug, finish)
                ? { ...l, quantity: l.quantity + quantity }
                : l,
            );
          }
          return [...prev, { product, finish, quantity }];
        }),
      updateQuantity: (slug, finish, quantity) =>
        setLines((prev) =>
          prev
            .map((l) => (sameLine(l, slug, finish) ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        ),
      removeItem: (slug, finish) =>
        setLines((prev) => prev.filter((l) => !sameLine(l, slug, finish))),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
