import { Skeleton } from "../ui/skeleton";
import { ProductCard } from "./ProductCard";
import { cn } from "../../lib/utils";
import type { Product } from "../../types/shop";

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading,
  skeletonCount = 4,
  emptyMessage,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-6", className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-soft" />
            <Skeleton className="h-4 w-2/3 bg-soft" />
            <Skeleton className="h-3 w-1/3 bg-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="py-16 text-center font-body text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("grid gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
