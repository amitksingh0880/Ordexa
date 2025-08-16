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
        alert("Failed to create orders");
      }
    },
  });

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create Order</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">Unique ID</label>
          <input
            className="border border-gray-300 rounded-md w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter User ID"
            {...form.register("userId")}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">Total Amount</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter Total Amount"
            {...form.register("totalAmount")}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-blue-700 transition duration-200"
          >
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
}
