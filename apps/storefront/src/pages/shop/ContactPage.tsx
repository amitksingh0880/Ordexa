import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@ui/components/ui/input";
import { Textarea } from "@ui/components/ui/textarea";
import { Button } from "@ui/components/ui/button";
import { SHOP } from "../../constants/shop";
import { contactSchema } from "../../lib/schemas";
import { messages } from "../../lib/resources";

const inputClass =
  "rounded-none border-0 border-b border-line bg-transparent px-0 focus-visible:border-ink focus-visible:ring-0";

export default function ContactPage() {
  const createMessage = messages.useCreate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "");
      return;
    }
    setError("");
    createMessage.mutate(
      { ...form, status: "Unread" },
      {
        onSuccess: () => {
          toast.success(SHOP.contact.success);
          setForm({ name: "", email: "", subject: "", body: "" });
        },
        onError: () => toast.error("Could not send message."),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-28 pt-16 md:px-12">
      <span className="mb-4 block font-body text-label uppercase tracking-[0.2em] text-ink-muted">
        {SHOP.contact.eyebrow}
      </span>
      <h1 className="font-display text-headline-sm font-light tracking-tight text-ink md:text-headline">
        {SHOP.contact.title}
      </h1>
      <p className="mt-6 max-w-xl font-body text-body-lg font-light text-ink-soft">
        {SHOP.contact.intro}
      </p>

      <form onSubmit={submit} className="mt-12 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            placeholder={SHOP.contact.nameLabel}
            value={form.name}
            onChange={update("name")}
            className={inputClass}
          />
          <Input
            type="email"
            placeholder={SHOP.contact.emailLabel}
            value={form.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
        <Input
          placeholder={SHOP.contact.subjectLabel}
          value={form.subject}
          onChange={update("subject")}
          className={inputClass}
        />
        <Textarea
          placeholder={SHOP.contact.bodyLabel}
          value={form.body}
          onChange={update("body")}
          rows={5}
          className="rounded-none border-line bg-transparent focus-visible:border-ink focus-visible:ring-0"
        />
        {error ? <p className="font-body text-xs text-destructive">{error}</p> : null}
        <Button
          type="submit"
          disabled={createMessage.isPending}
          className="rounded-none bg-ink px-10 py-6 font-body text-label uppercase tracking-[0.2em] text-white hover:bg-ink/80"
        >
          {SHOP.contact.submit}
        </Button>
      </form>
    </div>
  );
}
