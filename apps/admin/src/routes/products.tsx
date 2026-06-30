import { createFileRoute } from "@tanstack/react-router";
import ProductsPage from "../pages/ProductsPage";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});
