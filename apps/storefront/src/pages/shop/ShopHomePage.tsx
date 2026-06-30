import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
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
      <section className="group relative mx-auto flex min-h-screen max-w-[1800px] flex-col justify-center overflow-hidden px-6 py-0 md:px-12">
        <div
          aria-hidden
          className="hero-dots pointer-events-none absolute inset-0 transition-transform duration-700 group-hover:scale-125"
        />
        <div className="relative z-10 max-w-5xl">
          <div className="fade-in-up mb-6 inline-block">
            <span className="border-b border-line pb-1 font-body text-label uppercase tracking-[0.2em] text-ink-soft">
              {hero.eyebrow}
            </span>
          </div>
          <h1 className="fade-in-up delay-100 select-none font-display text-headline-sm uppercase leading-[0.85] text-ink md:text-display">
            {hero.titleTop}
            <br />
            <span className="text-outline italic">{hero.titleBottom}</span>
          </h1>
          <p className="fade-in-up delay-200 mt-6 max-w-xl font-body text-body-lg font-light text-ink-soft">
            {hero.body}
          </p>
          <div className="fade-in-up delay-300 mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              className="rounded-none bg-ink px-10 py-6 font-body text-label uppercase tracking-[0.2em] text-white hover:bg-ink/80"
            >
              <Link to={ROUTES.shopCollections}>{hero.primaryCta}</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-none border-line px-10 py-6 font-body text-label uppercase tracking-[0.2em] text-ink hover:border-ink hover:bg-transparent"
            >
              {hero.secondaryCta}
            </Button>
          </div>
        </div>
        <div className="fade-in-up delay-400 absolute bottom-12 right-6 hidden items-center gap-3 border border-line bg-surface-container px-4 py-3 lg:flex">
          <span className="size-2 animate-pulse rounded-full bg-ink" />
          <span className="font-body text-label uppercase tracking-[0.15em] text-ink">
            {hero.floatingStatus}
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-[1800px] px-6 md:px-12">
        <hr className="border-t border-line/60" />
      </div>

      <section className="mx-auto max-w-[1800px] px-6 py-28 md:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="mb-4 block font-body text-label uppercase tracking-[0.15em] text-ink-soft">
              {SHOP.featured.kicker}
            </span>
            <h2 className="font-display text-4xl tracking-tight text-ink md:text-6xl">
              {SHOP.featured.eyebrow}
            </h2>
          </div>
          <Link
            to={ROUTES.shopCollections}
            className="border-b border-ink pb-1 font-body text-label uppercase tracking-[0.15em] text-ink transition-colors hover:border-ink-soft hover:text-ink-soft"
          >
            {SHOP.featured.viewAll}
          </Link>
        </div>
        <ProductGrid
          products={featured}
          isLoading={isLoading}
          skeletonCount={SHOP.featured.limit}
          emptyMessage={SHOP.collectionsPage.emptyState}
          className="grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4"
        />
      </section>

      <section className="relative overflow-hidden bg-ink py-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(64,64,64,0.4),_transparent_60%)]" />
        <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 items-center gap-y-16 px-6 md:px-12 lg:grid-cols-12 lg:gap-x-24">
          <div className="flex flex-col gap-10 lg:col-span-5">
            <div>
              <span className="mb-6 block font-body text-label uppercase tracking-[0.3em] text-white/50">
                {editorial.eyebrow}
              </span>
              <h2 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-white md:text-7xl">
                {editorial.title}
              </h2>
            </div>
            <p className="font-body text-xl font-light leading-relaxed text-white/70">
              {editorial.body}
            </p>
            <button type="button" className="group flex items-center gap-4 self-start text-white">
              <span className="border-b border-white/30 pb-1 font-body text-label uppercase tracking-[0.15em] transition-colors group-hover:border-white">
                {editorial.cta}
              </span>
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </button>
          </div>
          <div className="relative lg:col-span-7">
            <div className="aspect-[4/3] overflow-hidden bg-neutral-900">
              <img
                src={editorial.image}
                alt={editorial.title}
                className="h-full w-full object-cover opacity-80 mix-blend-luminosity transition-all duration-700 hover:opacity-100 hover:mix-blend-normal"
              />
            </div>
            <div className="dark-glass absolute -bottom-8 -left-8 hidden max-w-sm p-10 md:block">
              <p className="font-body text-lg font-light leading-relaxed text-white/90">
                {editorial.quote}
              </p>
              <div className="my-6 h-px w-8 bg-white/30" />
              <p className="font-body text-label uppercase tracking-[0.15em] text-white/50">
                {editorial.quoteAuthor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1800px] bg-surface px-6 py-28 md:px-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="mb-6 block font-body text-label uppercase tracking-[0.15em] text-ink-soft">
            {newsletter.eyebrow}
          </span>
          <h3 className="mb-6 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
            {newsletter.title}
          </h3>
          <p className="mb-12 font-body text-lg font-light text-ink-soft">{newsletter.body}</p>
          <NewsletterForm className="max-w-md" />
        </div>
      </section>
    </>
  );
}
