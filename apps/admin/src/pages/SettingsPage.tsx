import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { AutoForm } from "@ui/components/ui/auto-form";
import { settingsApi } from "../lib/settings";
import { authApi } from "../lib/auth";
import { formatCurrency } from "../lib/format";
import { SETTINGS_COPY } from "../constants/app";
import { useAuth } from "../context/auth-context";

const profileSchema = z.object({
  name: z.string().min(1),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

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
    </div>
  );
}
