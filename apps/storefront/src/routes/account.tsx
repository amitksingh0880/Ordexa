import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../pages/shop/AccountPage";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});
