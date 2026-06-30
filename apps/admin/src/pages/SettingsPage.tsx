import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { AutoForm } from "@ui/components/ui/auto-form";
import { settingsApi } from "../lib/settings";
import { authApi } from "../lib/auth";
import { tenantsApi } from "../lib/tenants";
import { formatCurrency } from "../lib/format";
import { SETTINGS_COPY } from "../constants/app";
import { useAuth } from "../context/auth-context";

const profileSchema = z.object({
  name: z.string().min(1),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

const storefrontSchema = z.object({
  brand: z.string().min(1),
  tagline: z.string().optional(),
  currency: z.string().min(1),
  flatRate: z.number().min(0),
  freeThreshold: z.number().min(0),
});

function StorefrontCard({ tenantId }: { tenantId: string }) {
  const tenant = useQuery({ queryKey: ["tenant", tenantId], queryFn: () => tenantsApi.get(tenantId) });
  const cfg = tenant.data?.config ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{SETTINGS_COPY.storefront}</CardTitle>
      </CardHeader>
      <CardContent>
        {tenant.data ? (
          <AutoForm
            key={tenant.data.id}
            schema={storefrontSchema}
            submitText={SETTINGS_COPY.saveStorefront}
            defaultValues={{
              brand: cfg.brand ?? tenant.data.name,
              tagline: cfg.tagline ?? "",
              currency: cfg.currency ?? "",
              flatRate: cfg.shipping?.flatRate ?? 0,
              freeThreshold: cfg.shipping?.freeThreshold ?? 0,
            }}
            fieldConfig={{
              brand: { label: SETTINGS_COPY.brand },
              tagline: { label: SETTINGS_COPY.tagline },
              currency: { label: SETTINGS_COPY.currency },
              flatRate: { label: SETTINGS_COPY.flatRate, type: "number" },
              freeThreshold: { label: SETTINGS_COPY.freeOver, type: "number" },
            }}
            onSubmit={async (v) => {
              await tenantsApi.updateConfig(tenantId, {
                brand: v.brand,
                tagline: v.tagline,
                currency: v.currency,
                shipping: { flatRate: v.flatRate, freeThreshold: v.freeThreshold },
              });
              toast.success("Storefront updated");
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const config = useQuery({ queryKey: ["platform-config"], queryFn: settingsApi.config });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{SETTINGS_COPY.profile}</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            schema={profileSchema}
            submitText={SETTINGS_COPY.saveProfile}
            defaultValues={{ name: user?.name ?? "" }}
            fieldConfig={{
              name: { label: "Name" },
              currentPassword: { label: "Current password", type: "password" },
              newPassword: { label: "New password", type: "password" },
            }}
            onSubmit={async (v) => {
              await authApi.updateProfile({
                name: v.name,
                currentPassword: v.currentPassword || undefined,
                newPassword: v.newPassword || undefined,
              });
              toast.success("Profile updated");
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{SETTINGS_COPY.payment}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{SETTINGS_COPY.mode}</span>
            <Badge variant={config.data?.razorpay.enabled ? "default" : "secondary"}>
              {config.data?.razorpay.enabled ? SETTINGS_COPY.live : SETTINGS_COPY.test}
            </Badge>
          </div>
          {config.data?.razorpay.keyId ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Key</span>
              <span className="font-mono text-xs">{config.data.razorpay.keyId}</span>
            </div>
          ) : null}

          <div className="border-t pt-3">
            <p className="mb-2 font-medium">{SETTINGS_COPY.shipping}</p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{SETTINGS_COPY.freeOver}</span>
              <span>{config.data ? formatCurrency(config.data.shipping.freeThreshold) : "—"}</span>
            </div>
            <p className="text-muted-foreground mt-2 mb-1">{SETTINGS_COPY.methods}</p>
            {(config.data?.shipping.methods ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <span>{m.label} · {m.etaDays}d</span>
                <span>{m.cost === 0 ? "Free" : formatCurrency(m.cost)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {user ? <StorefrontCard tenantId={user.tenantId} /> : null}
    </div>
  );
}
