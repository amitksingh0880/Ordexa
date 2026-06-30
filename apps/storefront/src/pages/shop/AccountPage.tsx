import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, MapPin, Trash2, Star } from "lucide-react";
import { Button } from "@ui/components/ui/button";
import { Badge } from "@ui/components/ui/badge";
import { Separator } from "@ui/components/ui/separator";
import { AutoForm } from "@ui/components/ui/auto-form";
import { ROUTES, AUTH_COPY, ADDRESS_FIELDS } from "../../constants/app";
import { formatPrice } from "../../constants/shop";
import { addressSchema, type AddressValues } from "../../lib/schemas";
import { orders, addresses } from "../../lib/resources";
import { useAuth } from "../../context/auth-context";

function AddressBook() {
  const list = addresses.useList();
  const create = addresses.useCreate();
  const update = addresses.useUpdate();
  const remove = addresses.useRemove();
  const [adding, setAdding] = useState(false);

  const onAdd = async (values: AddressValues) => {
    await create.mutateAsync(values);
    setAdding(false);
    toast.success("Address saved");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-h3 font-bold text-ink">{AUTH_COPY.savedAddresses}</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="mr-1 size-4" />
          {AUTH_COPY.addAddress}
        </Button>
      </div>

      {adding ? (
        <div className="rounded-md border border-line p-5">
          <AutoForm
            schema={addressSchema}
            onSubmit={onAdd}
            submitText={AUTH_COPY.addAddress}
            fieldConfig={{
              label: { label: ADDRESS_FIELDS.label },
              fullName: { label: ADDRESS_FIELDS.fullName },
              phone: { label: ADDRESS_FIELDS.phone },
              line1: { label: ADDRESS_FIELDS.line1 },
              line2: { label: ADDRESS_FIELDS.line2 },
              city: { label: ADDRESS_FIELDS.city },
              state: { label: ADDRESS_FIELDS.state },
              postalCode: { label: ADDRESS_FIELDS.postalCode },
              country: { label: ADDRESS_FIELDS.country },
            }}
          />
        </div>
      ) : null}

      {list.data && list.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.data.map((a) => (
            <div key={a.id} className="rounded-md border border-line p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-body text-sm font-semibold text-ink">
                  <MapPin className="size-4" />
                  {a.label || a.fullName}
                  {a.isDefault ? <Badge variant="secondary">{AUTH_COPY.defaultLabel}</Badge> : null}
                </div>
              </div>
              <p className="mt-2 font-body text-sm text-ink-soft">
                {a.fullName}, {a.phone}
                <br />
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.postalCode}, {a.country}
              </p>
              <div className="mt-3 flex gap-3">
                {!a.isDefault ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 font-body text-xs text-ink-muted hover:text-ink"
                    onClick={() => update.mutate({ id: a.id, input: { isDefault: true } })}
                  >
                    <Star className="size-3.5" /> {AUTH_COPY.setDefault}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="flex items-center gap-1 font-body text-xs text-destructive hover:underline"
                  onClick={() => remove.mutate(a.id)}
                >
                  <Trash2 className="size-3.5" /> {AUTH_COPY.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !adding && <p className="font-body text-sm text-ink-muted">{AUTH_COPY.noAddresses}</p>
      )}
    </section>
  );
}

function OrderHistory() {
  const list = orders.useList();
  if (!list.data || list.data.length === 0) {
    return <p className="font-body text-sm text-ink-muted">{AUTH_COPY.noOrders}</p>;
  }
  return (
    <div className="space-y-3">
      {list.data.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded-md border border-line p-4">
          <div>
            <p className="font-body text-sm font-semibold text-ink">#{o.id.slice(0, 8)}</p>
            <p className="font-body text-xs text-ink-muted">
              {new Date(o.createdAt).toLocaleDateString()} · {o.items?.length ?? 0} item(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{o.status}</Badge>
            <span className="font-display font-bold text-ink">{formatPrice(o.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: ROUTES.login });
  }, [loading, user, navigate]);

  if (!user) return null;

  const onLogout = async () => {
    await logout();
    navigate({ to: ROUTES.shop });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h1 font-bold tracking-tighter text-ink">
            {AUTH_COPY.account}
          </h1>
          <p className="mt-1 font-body text-ink-soft">{user.name} · {user.email}</p>
        </div>
        <Button variant="outline" onClick={onLogout}>{AUTH_COPY.signOut}</Button>
      </div>

      <Separator className="my-8" />
      <h2 className="mb-4 font-display text-h3 font-bold text-ink">{AUTH_COPY.orderHistory}</h2>
      <OrderHistory />

      <Separator className="my-8" />
      <AddressBook />
    </div>
  );
}
