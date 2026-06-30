import { Link } from "@tanstack/react-router";
import { Globe, Share2 } from "lucide-react";
import { ROUTES } from "../../constants/app";
import { SHOP } from "../../constants/shop";

export function ShopFooter() {
  return (
    <footer className="w-full border-t border-line/20 bg-page py-20">
      <div className="mx-auto flex max-w-[1728px] flex-col justify-between gap-8 px-6 md:flex-row md:px-10">
        <div className="flex flex-col gap-4">
          <Link to={ROUTES.shop} className="font-display text-h2 text-ink">
            {SHOP.brand}
          </Link>
          <p className="max-w-[300px] font-body text-sm text-ink-muted">
            {SHOP.tagline}
          </p>
          <p className="font-body text-label uppercase tracking-[0.1em] text-ink-muted">
            {SHOP.copyright}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 md:grid-cols-3">
          {SHOP.footer.groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <span className="font-body text-label uppercase tracking-[0.1em] text-ink">
                {group.title}
              </span>
              {group.links.map((link, index) => (
                <Link
                  key={`${link.label}-${index}`}
                  to={link.to}
                  className="font-body text-label uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex gap-4 text-ink">
            <Globe className="size-5" />
            <Share2 className="size-5" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line px-4 py-1">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-body text-[10px] uppercase tracking-tight text-ink">
              {SHOP.footer.systemStatus}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
