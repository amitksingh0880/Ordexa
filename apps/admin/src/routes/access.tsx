import { createFileRoute } from "@tanstack/react-router";
import AccessPage from "../pages/AccessPage";

export const Route = createFileRoute("/access")({
  component: AccessPage,
});
