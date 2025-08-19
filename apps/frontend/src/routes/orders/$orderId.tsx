// src/routes/orders/$orderId.tsx
import { createFileRoute } from "@tanstack/react-router";
import OrderDetailPage from "../../pages/GetOrderPage";

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailWrapper,
});

function OrderDetailWrapper() {
  const { orderId } = Route.useParams();
  return <OrderDetailPage orderId={orderId} />;
}
