import { useForm } from "@tanstack/react-form";
import axios from "axios";

export const Route = new Route({
  path: "/orders/create",
  component: CreateOrderPage,
});

function CreateOrderPage() {
  const form = useForm({
    defaultValues: {
      userId: "",
      totalAmount: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await axios.post("/api/orders", {
          userId: value.userId,
          totalAmount: parseFloat(value.totalAmount),
        });
        alert("Order created successfully!");
      } catch (err) {
        alert("Failed to create order");
      }
    },
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create Order</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">User ID</label>
          <input
            className="border rounded w-full p-2"
            {...form.register("userId")}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Total Amount</label>
          <input
            type="number"
            className="border rounded w-full p-2"
            {...form.register("totalAmount")}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
}
