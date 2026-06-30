import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Input } from "@ui/components/ui/input";
import { Textarea } from "@ui/components/ui/textarea";
import { Button } from "@ui/components/ui/button";
import { cn } from "@ui/lib/utils";
import { SHOP } from "../../constants/shop";
import { reviewSchema } from "../../lib/schemas";
import { reviews as reviewsResource } from "../../lib/resources";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-flare-deep text-flare-deep" : "text-line",
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const { data } = reviewsResource.useList({ productSlug, status: "Published" });
  const createReview = reviewsResource.useCreate();

  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const published = data ?? [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = reviewSchema.safeParse({ author, rating, body });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "");
      return;
    }
    setError("");
    createReview.mutate(
      { productSlug, author, rating, body, status: "Pending" },
      {
        onSuccess: () => {
          toast.success(SHOP.reviews.success);
          setAuthor("");
          setBody("");
          setRating(5);
        },
        onError: () => toast.error("Could not submit review."),
      },
    );
  };

  return (
    <section className="mt-32 grid grid-cols-1 gap-16 lg:grid-cols-2">
      <div>
        <h2 className="mb-8 font-display text-h2 font-medium text-ink">{SHOP.reviews.title}</h2>
        {published.length === 0 ? (
          <p className="font-body text-sm text-ink-soft">{SHOP.reviews.empty}</p>
        ) : (
          <div className="space-y-8">
            {published.map((review) => (
              <div key={review.id} className="border-b border-line/40 pb-6">
                <StarRow rating={review.rating} />
                {review.title ? (
                  <p className="mt-3 font-body text-sm font-semibold text-ink">{review.title}</p>
                ) : null}
                <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink-soft">
                  {review.body}
                </p>
                <p className="mt-3 font-body text-label uppercase tracking-[0.15em] text-ink-muted">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="space-y-6">
        <h3 className="font-display text-h2 font-medium text-ink">{SHOP.reviews.writeTitle}</h3>
        <div className="space-y-2">
          <span className="font-body text-label uppercase tracking-[0.15em] text-ink-muted">
            {SHOP.reviews.ratingLabel}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1} stars`}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    i < rating ? "fill-flare-deep text-flare-deep" : "text-line",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <Input
          placeholder={SHOP.reviews.nameLabel}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="rounded-none border-0 border-b border-line bg-transparent px-0 focus-visible:border-ink focus-visible:ring-0"
        />
        <Textarea
          placeholder={SHOP.reviews.bodyLabel}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="rounded-none border-line bg-transparent focus-visible:border-ink focus-visible:ring-0"
        />
        {error ? <p className="font-body text-xs text-destructive">{error}</p> : null}
        <Button
          type="submit"
          disabled={createReview.isPending}
          className="rounded-none bg-ink px-10 py-6 font-body text-label uppercase tracking-[0.2em] text-white hover:bg-ink/80"
        >
          {SHOP.reviews.submit}
        </Button>
      </form>
    </section>
  );
}
