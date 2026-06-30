import { useEffect, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowUpRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { Stars } from "../../components/shop/Stars";
import { ProductCard } from "../../components/shop/ProductCard";
import { cn } from "../../lib/utils";
import { ROUTES } from "../../constants/app";
import { SHOP, formatPrice } from "../../constants/shop";
import { products } from "../../lib/resources";
import { useCart } from "../../context/cart-context";

const TRUST_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  truck: Truck,
  shield: ShieldCheck,
  leaf: Leaf,
};

export default function ProductDetailPage({ productId }: { productId: string }) {
  const { data: product, isLoading, isError } = products.useGet(productId);
  const { data: related } = products.useList(
    { collectionSlug: product?.collectionSlug },
    { enabled: Boolean(product) },
  );
  const { addItem, setOpen } = useCart();
  const [finish, setFinish] = useState("");

  useEffect(() => {
    if (product?.finishes.length) setFinish(product.finishes[0]);
  }, [product]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1728px] grid-cols-1 gap-6 px-6 py-16 md:px-10 lg:grid-cols-12">
        <Skeleton className="aspect-[4/5] rounded-3xl bg-soft lg:col-span-7" />
        <div className="space-y-6 lg:col-span-5">
          <Skeleton className="h-12 w-2/3 bg-soft" />
          <Skeleton className="h-24 w-full bg-soft" />
          <Skeleton className="h-10 w-1/2 bg-soft" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <p className="font-body text-body-lg text-ink-soft">{SHOP.product.notFound}</p>
        <Button asChild className="rounded-full bg-ink px-8 text-white hover:bg-ink/90">
          <Link to={ROUTES.shopCollections}>{SHOP.product.backToShop}</Link>
        </Button>
      </div>
    );
  }

  const gallery = product.images;
  const relatedItems = (related ?? [])
    .filter((p) => p.slug !== product.slug)
    .slice(0, SHOP.product.relatedLimit);
  const specs = product.specs ?? [];

  const handleAddToBag = () => {
    addItem(product, finish);
    setOpen(true);
    toast.success(SHOP.cart.addedToBag);
  };

  return (
    <div className="mx-auto max-w-[1728px] px-6 pb-24 pt-8 md:px-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-soft">
            <img
              src={gallery[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.badge ? (
              <Badge className="glass absolute right-4 top-4 rounded-full border border-white/40 px-4 py-1 font-body text-label uppercase tracking-[0.1em] text-ink">
                {product.badge}
              </Badge>
            ) : null}
          </div>
          {gallery.length > 1 ? (
            <div className="grid grid-cols-2 gap-6">
              {gallery.slice(1, 3).map((src, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-2xl bg-soft"
                >
                  <img
                    src={src}
                    alt={`${product.name} ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-8 pt-4 lg:sticky lg:top-28 lg:col-span-5 lg:pt-0">
          <div className="space-y-2">
            <h2 className="font-body text-label uppercase tracking-[0.2em] text-ink-muted">
              {product.series}
            </h2>
            <h1 className="font-display text-headline-sm leading-tight tracking-tighter text-ink md:text-headline">
              {product.name}
            </h1>
          </div>
          <p className="font-body text-body-lg text-ink-soft">{product.description}</p>

          <div className="flex items-center justify-between border-y border-line/30 py-6">
            <span className="font-display text-h2 font-bold text-ink">
              {formatPrice(product.price, product.currency)}
            </span>
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>

          {product.finishes.length > 0 ? (
            <div className="space-y-4">
              <span className="font-body text-label uppercase tracking-[0.1em] text-ink-muted">
                {SHOP.product.chooseFinish}
              </span>
              <div className="flex gap-3">
                {product.finishes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFinish(option)}
                    aria-label={option}
                    aria-pressed={finish === option}
                    className={cn(
                      "size-10 rounded-full border border-line ring-offset-2 transition-all ring-offset-page",
                      finish === option
                        ? "ring-2 ring-ink"
                        : "ring-0 hover:ring-2 hover:ring-line",
                    )}
                    style={{ backgroundColor: option }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 pt-2">
            <Button
              onClick={handleAddToBag}
              className="w-full rounded-full bg-ink py-6 font-body text-label uppercase tracking-[0.15em] text-white hover:bg-ink/90"
            >
              {SHOP.product.addToBag}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-ink/30 py-6 font-body text-label uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-white"
            >
              {SHOP.product.findInStore}
            </Button>
          </div>

          <div className="flex flex-wrap gap-8 pt-4">
            {SHOP.product.trustMarkers.map((marker) => {
              const Icon = TRUST_ICONS[marker.icon];
              return (
                <div key={marker.label} className="flex items-center gap-2">
                  {Icon ? <Icon className="size-5 text-ink-soft" /> : null}
                  <span className="font-body text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                    {marker.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {specs.length > 0 ? (
        <section className="mt-24">
          <div className="mb-8 border-b border-line pb-4">
            <h2 className="font-display text-h2 text-ink">{SHOP.product.specTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {specs.map((spec, index) => (
              <Card
                key={spec.label}
                className={cn(
                  "flex h-44 flex-col justify-between rounded-2xl border-0 p-8 shadow-none",
                  index === 1 ? "bg-ink text-white" : "bg-soft text-ink",
                )}
              >
                <span className="font-body text-label uppercase tracking-[0.1em] opacity-60">
                  {spec.label}
                </span>
                <h3 className="font-display text-h2 font-bold">{spec.value}</h3>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative mt-24 h-[600px] overflow-hidden rounded-3xl">
        <img
          src={gallery[gallery.length - 1]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div className="glass max-w-3xl rounded-3xl p-12">
            <h2 className="mb-8 font-display text-h2 text-ink md:text-headline-sm">
              {SHOP.product.showcase.title}
            </h2>
            <p className="mb-12 font-body text-body-lg text-ink-soft">
              {SHOP.product.showcase.body}
            </p>
            <Button className="rounded-full bg-ink px-8 py-5 font-body text-label uppercase tracking-[0.15em] text-white hover:bg-ink/90">
              {SHOP.product.showcase.cta}
            </Button>
          </div>
        </div>
      </section>

      {relatedItems.length > 0 ? (
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-h2 text-ink">{SHOP.product.relatedTitle}</h2>
            <Link
              to={ROUTES.shopCollections}
              className="flex items-center gap-2 font-body text-label uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
            >
              {SHOP.product.relatedViewAll}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="no-scrollbar flex snap-x gap-6 overflow-x-auto pb-4">
            {relatedItems.map((item) => (
              <div key={item.id} className="w-[320px] flex-shrink-0 snap-start md:w-[380px]">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Separator className="mt-24 bg-line/30" />
    </div>
  );
}
