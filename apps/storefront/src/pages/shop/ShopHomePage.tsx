import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Zap } from "lucide-react";
import { Button } from "@ui/components/ui/button";
import { NewsletterForm } from "../../components/shop/NewsletterForm";
import { ProductGrid } from "../../components/shop/ProductGrid";
import { ROUTES } from "../../constants/app";
import { SHOP } from "../../constants/shop";
import { products } from "../../lib/resources";

export default function ShopHomePage() {
  const { data, isLoading } = products.useList({ featured: true });
  const featured = data?.slice(0, SHOP.featured.limit);
  const { hero, editorial, newsletter } = SHOP;

  return (
    <>
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 md:px-10">
        <div className="relative z-10 max-w-[1728px] text-center">
          <div className="glass mb-8 inline-block rounded-full border border-ink/20 px-4 py-1">
            <span className="font-body text-label uppercase tracking-[0.2em] text-ink">
              {hero.eyebrow}
            </span>
          </div>
          <h1 className="select-none font-display text-headline-sm uppercase leading-none text-ink md:text-display">
            {hero.titleTop}
            <br />
            <span className="text-outline italic">{hero.titleBottom}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl font-body text-body-lg text-ink-soft">
            {hero.body}
          </p>
          <div className="mt-12 flex flex-col justify-center gap-4 md:flex-row">
            <Button
              asChild
              className="rounded-full bg-ink px-12 py-6 font-body text-label uppercase tracking-[0.15em] text-white hover:bg-ink/90"
            >
              <Link to={ROUTES.shopCollections}>{hero.primaryCta}</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-ink px-12 py-6 font-body text-label uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-white"
            >
              {hero.secondaryCta}
            </Button>
          </div>
        </div>
        <div className="glass absolute bottom-10 left-10 hidden items-center gap-2 rounded-2xl p-6 shadow-xl lg:flex">
          <Zap className="size-5 fill-ink text-ink" />
          <span className="font-body text-label uppercase tracking-[0.1em] text-ink">
            {hero.floatingStatus}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1728px] px-6 py-24 md:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-headline-sm text-ink md:text-headline">
              {SHOP.featured.eyebrow}
            </h2>
            <p className="mt-2 max-w-md font-body text-body-lg text-ink-soft">
              {SHOP.featured.subtitle}
            </p>
          </div>
          <Link
            to={ROUTES.shopCollections}
            className="border-b border-ink pb-1 font-body text-label uppercase tracking-[0.1em] text-ink"
          >
            {SHOP.featured.viewAll}
          </Link>
        </div>
        <ProductGrid
          products={featured}
          isLoading={isLoading}
          skeletonCount={SHOP.featured.limit}
          emptyMessage={SHOP.collectionsPage.emptyState}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </section>

      <section className="overflow-hidden bg-ink py-24 text-white">
        <div className="mx-auto grid max-w-[1728px] grid-cols-1 items-center gap-16 px-6 md:px-10 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <span className="font-body text-label uppercase tracking-[0.3em] text-ink-muted">
              {editorial.eyebrow}
            </span>
            <h2 className="font-display text-headline-sm leading-tight md:text-headline">
              {editorial.title}
            </h2>
            <p className="font-body text-body-lg leading-relaxed text-white/70">
              {editorial.body}
            </p>
            <button
              type="button"
              className="group flex items-center gap-3 self-start"
            >
              <span className="border-b border-white pb-1 font-body text-label uppercase tracking-[0.15em] transition-all group-hover:pr-2">
                {editorial.cta}
              </span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
          <div className="relative lg:col-span-7">
            <div className="aspect-video overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={editorial.image}
                alt={editorial.title}
                className="h-full w-full object-cover grayscale transition-all duration-1000 hover:grayscale-0"
              />
            </div>
            <div className="glass absolute -bottom-8 -left-8 hidden max-w-xs rounded-2xl p-6 md:block">
              <p className="font-body text-sm italic text-ink">{editorial.quote}</p>
              <p className="mt-3 font-body text-label uppercase tracking-[0.1em] text-ink">
                {editorial.quoteAuthor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1728px] px-6 py-24 md:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h3 className="mb-8 font-display text-h2 text-ink">{newsletter.title}</h3>
          <p className="mb-12 font-body text-sm text-ink-soft">{newsletter.body}</p>
          <NewsletterForm className="max-w-xl" />
        </div>
      </section>
    </>
  );
}
