import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Input } from "@ui/components/ui/input";
import { Separator } from "@ui/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { Skeleton } from "@ui/components/ui/skeleton";
import { ProductGrid } from "../../components/shop/ProductGrid";
import { NewsletterForm } from "../../components/shop/NewsletterForm";
import { cn } from "@ui/lib/utils";
import { SHOP } from "../../constants/shop";
import { SEARCH_COPY } from "../../constants/app";
import { products as productsResource, collections as collectionsResource } from "../../lib/resources";

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function CollectionsPage() {
  const [query, setQuery] = useState("");
  const search = useDebounced(query, 300);
  const { data: products, isLoading } = productsResource.useList(
    search ? { search } : undefined,
  );
  const { data: collections } = collectionsResource.useList();
  const header = collections?.[0];

  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sort, setSort] = useState<string>(SHOP.collectionsPage.defaultSort);

  const seriesOptions = useMemo(
    () => unique((products ?? []).map((p) => p.series)),
    [products],
  );
  const colorOptions = useMemo(
    () => unique((products ?? []).flatMap((p) => p.colors)),
    [products],
  );

  const visible = useMemo(() => {
    let list = [...(products ?? [])];
    if (series.length > 0) list = list.filter((p) => series.includes(p.series));
    if (colors.length > 0)
      list = list.filter((p) => p.colors.some((c) => colors.includes(c)));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "featured")
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, series, colors, sort]);

  const toggle = (
    value: string,
    list: string[],
    setList: (next: string[]) => void,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  return (
    <>
      <section className="mx-auto max-w-[1728px] px-6 pb-16 pt-16 md:px-10">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-line/40 pb-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 block font-body text-label uppercase tracking-[0.2em] text-ink-muted">
              {header?.tagline ?? " "}
            </span>
            {header ? (
              <h1 className="font-display text-headline-sm font-light tracking-tight text-ink md:text-headline">
                {header.name}
              </h1>
            ) : (
              <Skeleton className="h-16 w-72 rounded-none bg-surface-container" />
            )}
            <p className="mt-6 max-w-xl font-body text-body-lg font-light text-ink-soft">
              {header?.description ?? ""}
            </p>
          </div>
          <div className="flex items-end gap-4">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={SEARCH_COPY.placeholder}
                className="w-48 rounded-none border-0 border-b border-ink bg-transparent pl-6 font-body focus-visible:ring-0"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="rounded-none border-0 border-b border-ink bg-transparent font-body text-label uppercase tracking-[0.1em]">
                <SelectValue placeholder={SHOP.collectionsPage.sortLabel} />
              </SelectTrigger>
              <SelectContent>
                {SHOP.collectionsPage.sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1728px] flex-col gap-16 px-6 pb-24 md:flex-row md:px-10">
        <aside className="w-full flex-shrink-0 space-y-8 md:w-64">
          <div>
            <h3 className="mb-6 font-body text-label uppercase tracking-[0.15em] text-ink">
              {SHOP.collectionsPage.colorFilterLabel}
            </h3>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggle(color, colors, setColors)}
                  aria-label={color}
                  aria-pressed={colors.includes(color)}
                  className={cn(
                    "size-8 rounded-full ring-offset-2 transition-all ring-offset-page",
                    colors.includes(color)
                      ? "ring-2 ring-ink"
                      : "ring-0 hover:ring-2 hover:ring-ink-muted",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Separator className="bg-line/40" />

          <div>
            <h3 className="mb-6 font-body text-label uppercase tracking-[0.15em] text-ink">
              {SHOP.collectionsPage.seriesFilterLabel}
            </h3>
            <div className="space-y-4">
              {seriesOptions.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={series.includes(option)}
                    onCheckedChange={() => toggle(option, series, setSeries)}
                  />
                  <span
                    className={cn(
                      "font-body text-sm transition-colors",
                      series.includes(option)
                        ? "font-semibold text-ink"
                        : "text-ink-soft",
                    )}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Separator className="bg-line/40" />

          <div className="border border-line/40 p-6 transition-colors hover:border-ink/30">
            <h4 className="mb-2 font-body text-sm font-semibold text-ink">
              {SHOP.collectionsPage.curation.title}
            </h4>
            <p className="font-body text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ink-soft">
              {SHOP.collectionsPage.curation.body}
            </p>
            <button
              type="button"
              className="mt-6 flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.1em] text-ink"
            >
              {SHOP.collectionsPage.curation.cta}
              <ArrowRight className="size-3" />
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <ProductGrid
            products={visible}
            isLoading={isLoading}
            skeletonCount={6}
            emptyMessage={SHOP.collectionsPage.emptyState}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
          />
        </div>
      </section>

      <section className="bg-surface-low py-24">
        <div className="mx-auto grid max-w-[1728px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
          <div>
            <h2 className="mb-8 font-display text-h2 font-light text-ink">
              {SHOP.collectionsPage.informedTitle}
            </h2>
            <p className="max-w-sm font-body text-sm font-light text-ink-soft">
              {SHOP.collectionsPage.informedBody}
            </p>
          </div>
          <NewsletterForm className="max-w-md" />
        </div>
      </section>
    </>
  );
}
