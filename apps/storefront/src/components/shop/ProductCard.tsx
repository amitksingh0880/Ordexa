import { Link } from "@tanstack/react-router";
import { Card } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { cn } from "@ui/lib/utils";
import { ROUTES } from "../../constants/app";
import { formatPrice } from "../../constants/shop";
import type { Product } from "../../types/shop";

interface ProductCardProps {
  product: Product;
  aspect?: string;
  className?: string;
}

export function ProductCard({
  product,
  aspect = "aspect-[3/4]",
  className,
}: ProductCardProps) {
  return (
    <Link
      to={ROUTES.shopProductPattern}
      params={{ productId: product.slug }}
      className={cn("group block", className)}
    >
      <Card className="gap-4 rounded-none border-0 bg-transparent p-0 shadow-none">
        <div className={cn("relative overflow-hidden bg-surface-container", aspect)}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/5" />
          {product.badge ? (
            <Badge className="absolute left-4 top-4 rounded-none border-0 bg-white/90 px-4 py-1.5 font-body text-label uppercase tracking-[0.15em] text-ink backdrop-blur-sm">
              {product.badge}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-medium tracking-tight text-ink">
              {product.name}
            </h3>
            <p className="mt-1 font-body text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              {product.series}
            </p>
          </div>
          <span className="font-body text-base font-light text-ink-soft">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
