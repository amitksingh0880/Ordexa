import { createFileRoute } from "@tanstack/react-router";
import CollectionsPage from "../pages/shop/CollectionsPage";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
});
