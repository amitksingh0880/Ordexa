import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "@ui/lib/utils";
import { wishlist } from "../../lib/resources";
import { ROUTES, WISHLIST_COPY } from "../../constants/app";
import { useAuth } from "../../context/auth-context";

export function WishlistButton({
  productSlug,
  className,
}: {
  productSlug: string;
  className?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const list = wishlist.useList(undefined, { enabled: Boolean(user) });
  const create = wishlist.useCreate();
  const remove = wishlist.useRemove();

  const saved = list.data?.find((w) => w.productSlug === productSlug);

  const toggle = () => {
    if (!user) {
      navigate({ to: ROUTES.login });
      return;
    }
    if (saved) remove.mutate(saved.id);
    else create.mutate({ productSlug });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? WISHLIST_COPY.remove : WISHLIST_COPY.add}
      aria-pressed={Boolean(saved)}
      className={cn("text-ink transition-colors hover:text-ink-soft", className)}
    >
      <Heart className={cn("size-5", saved ? "fill-current" : "")} />
    </button>
  );
}
