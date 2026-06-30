import { createFileRoute } from "@tanstack/react-router";
import JournalPage from "../pages/shop/JournalPage";

export const Route = createFileRoute("/journal")({
  component: JournalPage,
});
