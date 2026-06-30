import { createFileRoute } from "@tanstack/react-router";
import ShopHomePage from "../pages/shop/ShopHomePage";

export const Route = createFileRoute("/")({
  component: ShopHomePage,
});
