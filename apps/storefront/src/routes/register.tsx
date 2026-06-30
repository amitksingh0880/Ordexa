import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "../pages/shop/AuthPage";

export const Route = createFileRoute("/register")({
  component: () => <AuthPage mode="register" />,
});
