import { useEffect, useState } from "react";
import axios from "axios";

type OrderItem = {
  id: string;
  name: string;
  price: number;
};

type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

type OrderDetailPageProps = {
  orderId: string;
};

function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await axios.get<Order>(`/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        alert("❌ Failed to fetch order details");
        console.error(err);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (!order) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Order Details</h1>
      <div className="space-y-4">
        <div>
          <strong>Order ID:</strong> {order.id}
        </div>
        <div>
          <strong>User ID:</strong> {order.userId}
        </div>
        <div>
          <strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}
        </div>
        <div>
          <strong>Status:</strong> {order.status}
        </div>
        <div>
          <strong>Items:</strong>
          {order.items?.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.name} - ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No items in this order.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
