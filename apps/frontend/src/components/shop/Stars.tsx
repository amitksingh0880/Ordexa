import { Star } from "lucide-react";
import { SHOP } from "../../constants/shop";

interface StarsProps {
  rating: number;
  reviews: number;
}

export function Stars({ rating, reviews }: StarsProps) {
  return (
    <div className="flex items-center gap-2">
      <Star className="size-4 fill-flare-deep text-flare-deep" />
      <span className="font-body text-label uppercase tracking-[0.1em] text-ink">
        {rating.toFixed(1)} ({reviews} {SHOP.product.reviewsSuffix})
      </span>
    </div>
  );
}
