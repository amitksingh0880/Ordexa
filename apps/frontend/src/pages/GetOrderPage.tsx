import { useEffect, useState } from "react";
import axios from "axios";

type Order = {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  description?: string;
  createdAt: string;
};

type OrderListResponse = {
  orders: Order[];
  pagingState?: string;
  limit?: number;
};

type UserOrdersPageProps = {
  userId: string;
};

function UserOrdersPage({ userId }: UserOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await axios.get<OrderListResponse>(
          `http://localhost:5000/orders/${userId}`
        );
        setOrders(response.data.orders);
      } catch (err) {
        alert("❌ Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Orders for User {userId}</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.orderId} className="p-4 border rounded shadow-sm">
              <p>
                <strong>Order ID:</strong> {order.orderId}
              </p>
              <p>
                <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              {order.description && (
                <p>
                  <strong>Description:</strong> {order.description}
                </p>
              )}
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserOrdersPage;
