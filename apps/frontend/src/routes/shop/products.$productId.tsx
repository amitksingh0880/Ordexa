import { createFileRoute } from "@tanstack/react-router";
import ProductDetailPage from "../../pages/shop/ProductDetailPage";

function RouteComponent() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={productId} />;
}

export const Route = createFileRoute("/shop/products/$productId")({
  component: RouteComponent,
});
