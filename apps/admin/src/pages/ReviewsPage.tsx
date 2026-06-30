import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import {
  REVIEW_STATUS,
  REVIEW_STATUS_TABS,
  REVIEW_STATUS_VARIANT,
} from "../constants/app";
import { formatDateTime } from "../lib/format";
import { reviews } from "../lib/resources";
import type { Review } from "../types/domain";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [status, setStatus] = useState<string>(REVIEW_STATUS.Pending);
  const { data, isLoading } = reviews.useList({ status });
  const updateReview = reviews.useUpdate();

  const moderate = (review: Review, next: string) => {
    updateReview.mutate(
      { id: review.id, input: { status: next } },
      {
        onSuccess: () => toast.success(`Review ${next.toLowerCase()}`),
        onError: () => toast.error("Failed to update review"),
      },
    );
  };

  const list = data ?? [];

  return (
    <div className="space-y-4">
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {REVIEW_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No {status.toLowerCase()} reviews.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{review.author}</div>
                    <div className="text-muted-foreground text-xs">{review.productSlug}</div>
                  </div>
                  <Badge variant={REVIEW_STATUS_VARIANT[review.status] ?? "secondary"}>
                    {review.status}
                  </Badge>
                </div>
                <Stars rating={review.rating} />
                {review.title ? <p className="text-sm font-semibold">{review.title}</p> : null}
                <p className="text-muted-foreground text-sm">{review.body}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(review.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    {review.status !== REVIEW_STATUS.Published ? (
                      <Button
                        size="sm"
                        disabled={updateReview.isPending}
                        onClick={() => moderate(review, REVIEW_STATUS.Published)}
                      >
                        Approve
                      </Button>
                    ) : null}
                    {review.status !== REVIEW_STATUS.Rejected ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={updateReview.isPending}
                        onClick={() => moderate(review, REVIEW_STATUS.Rejected)}
                      >
                        Reject
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
