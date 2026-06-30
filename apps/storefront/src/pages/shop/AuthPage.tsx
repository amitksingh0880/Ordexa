import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AutoForm } from "@ui/components/ui/auto-form";
import { ROUTES, AUTH_COPY } from "../../constants/app";
import { loginSchema, registerSchema } from "../../lib/schemas";
import { useAuth } from "../../context/auth-context";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  const onSubmit = async (values: Record<string, string>) => {
    setError("");
    try {
      if (isLogin) await login(values.email, values.password);
      else await register(values.name, values.email, values.password);
      toast.success(isLogin ? "Welcome back" : "Account created");
      navigate({ to: ROUTES.account });
    } catch {
      setError(isLogin ? AUTH_COPY.invalidCredentials : AUTH_COPY.registerFailed);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <h1 className="font-display text-h1 font-bold tracking-tighter text-ink">
        {isLogin ? AUTH_COPY.signIn : AUTH_COPY.signUp}
      </h1>
      <p className="mt-2 font-body text-ink-soft">
        {isLogin ? AUTH_COPY.loginSubtitle : AUTH_COPY.registerSubtitle}
      </p>

      <div className="mt-8">
        <AutoForm
          schema={isLogin ? loginSchema : registerSchema}
          onSubmit={onSubmit}
          submitText={isLogin ? AUTH_COPY.signIn : AUTH_COPY.signUp}
          fieldConfig={{
            name: { label: AUTH_COPY.name },
            email: { label: AUTH_COPY.email, placeholder: "you@example.com" },
            password: { label: AUTH_COPY.password, type: "password", placeholder: "••••••••" },
          }}
        />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </div>

      <p className="mt-6 font-body text-sm text-ink-soft">
        {isLogin ? AUTH_COPY.noAccount : AUTH_COPY.haveAccount}{" "}
        <Link
          to={isLogin ? ROUTES.register : ROUTES.login}
          className="font-semibold text-ink underline-offset-4 hover:underline"
        >
          {isLogin ? AUTH_COPY.signUp : AUTH_COPY.signIn}
        </Link>
      </p>
    </div>
  );
}
