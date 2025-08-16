import { useEffect, useState } from "react";
import axios from "axios";

function OrderDetailPage({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        alert("Failed to fetch order details");
      }
    }

    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

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
          <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
        </div>
        <div>
          <strong>Status:</strong> {order.status}
        </div>
        <div>
          <strong>Items:</strong>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id}>{item.name} - ${item.price}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
