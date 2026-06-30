import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { AutoForm } from "@ui/components/ui/auto-form";
import { useAuth } from "../context/auth-context";
import { APP, ROUTES } from "../constants/app";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError("");
    try {
      await login(values.email, values.password);
      toast.success("Signed in");
      navigate({ to: ROUTES.dashboard });
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-lg text-lg font-bold">
            O
          </div>
          <CardTitle className="text-xl">{APP.name} {APP.tagline}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AutoForm
            schema={loginSchema}
            onSubmit={onSubmit}
            submitText="Sign in"
            fieldConfig={{
              email: { label: "Email", placeholder: "admin@ordexa.shop" },
              password: { label: "Password", type: "password", placeholder: "••••••••" },
            }}
          />
          {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
