import { Link } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ROUTES } from "../../constants/app";
import { formatPrice } from "../../constants/shop";
import type { Product } from "../../types/shop";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={ROUTES.shopProductPattern}
      params={{ productId: product.slug }}
      className="group block"
    >
      <Card className="gap-3 rounded-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.badge ? (
            <Badge className="glass absolute right-4 top-4 rounded-full border-0 px-3 py-1 font-body text-label uppercase tracking-[0.1em] text-ink">
              {product.badge}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-body text-sm font-semibold uppercase tracking-tight text-ink">
              {product.name}
            </h3>
            <p className="mt-1 font-body text-label uppercase tracking-[0.1em] text-ink-muted">
              {product.series}
            </p>
          </div>
          <span className="font-body text-sm text-ink">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
