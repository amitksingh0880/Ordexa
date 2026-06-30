import { createFileRoute } from "@tanstack/react-router";
import { ShopLayout } from "../components/shop/ShopLayout";

export const Route = createFileRoute("/shop")({
  component: ShopLayout,
});
