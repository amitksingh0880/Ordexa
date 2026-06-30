import { ArrowUpRight } from "lucide-react";
import { SHOP } from "../../constants/shop";

export default function JournalPage() {
  const { journal } = SHOP;

  return (
    <div className="mx-auto max-w-[1800px] px-6 pb-28 pt-16 md:px-12">
      <header className="max-w-2xl border-b border-line/40 pb-12">
        <span className="mb-4 block font-body text-label uppercase tracking-[0.2em] text-ink-muted">
          {journal.eyebrow}
        </span>
        <h1 className="font-display text-headline-sm tracking-tight text-ink md:text-headline">
          {journal.title}
        </h1>
        <p className="mt-6 font-body text-body-lg font-light text-ink-soft">
          {journal.intro}
        </p>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {journal.entries.map((entry) => (
          <article key={entry.title} className="group flex flex-col gap-5">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-soft">
              <img
                src={entry.image}
                alt={entry.title}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-3 font-body text-label uppercase tracking-[0.15em] text-ink-muted">
              <span>{entry.tag}</span>
              <span className="size-1 rounded-full bg-ink-muted" />
              <span>{entry.date}</span>
            </div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              {entry.title}
            </h2>
            <p className="font-body text-sm font-light leading-relaxed text-ink-soft">
              {entry.excerpt}
            </p>
            <button
              type="button"
              className="mt-auto flex items-center gap-2 self-start border-b border-ink pb-1 font-body text-label uppercase tracking-[0.15em] text-ink transition-colors group-hover:border-ink-soft group-hover:text-ink-soft"
            >
              {journal.readMore}
              <ArrowUpRight className="size-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
