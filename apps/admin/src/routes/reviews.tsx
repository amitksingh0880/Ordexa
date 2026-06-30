import { createFileRoute } from "@tanstack/react-router";
import ReviewsPage from "../pages/ReviewsPage";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
});
