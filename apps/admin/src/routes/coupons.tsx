import { createFileRoute } from "@tanstack/react-router";
import CouponsPage from "../pages/CouponsPage";

export const Route = createFileRoute("/coupons")({
  component: CouponsPage,
});
