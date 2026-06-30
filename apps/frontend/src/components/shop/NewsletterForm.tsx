import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { SHOP } from "../../constants/shop";
import { newsletterSchema } from "../../lib/schemas";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "");
      return;
    }
    setError("");
    setEmail("");
    toast.success(SHOP.newsletter.success);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={SHOP.newsletter.placeholder}
          aria-label={SHOP.newsletter.placeholder}
          className="h-auto rounded-none border-0 border-b border-line bg-transparent px-0 py-4 pr-10 font-body text-label uppercase tracking-[0.1em] shadow-none focus-visible:border-ink focus-visible:ring-0"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 text-ink hover:bg-transparent"
          aria-label="Subscribe"
        >
          <ArrowRight className="size-5" />
        </Button>
      </div>
      {error ? <p className="mt-2 font-body text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
