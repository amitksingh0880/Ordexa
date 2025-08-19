import { createFileRoute } from "@tanstack/react-router";
import CreateOrderPage from "../../pages/CreateOrderPage";

export const Route = createFileRoute('/orders/create')({
  component: CreateOrderPage
});
