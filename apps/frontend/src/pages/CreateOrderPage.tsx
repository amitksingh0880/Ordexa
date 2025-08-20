import { useForm } from "@tanstack/react-form";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function CreateOrderPage() {
  const form = useForm({
    defaultValues: {
      userId: uuidv4(), // 🔧 Auto-generate UUID here
      totalAmount: "",
      status: "Created",
      description: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await axios.post("http://localhost:5000/order/create", {
          userId: value.userId,
          totalAmount: parseFloat(value.totalAmount),
          status: value.status,
          description: value.description,
        });
        alert("✅ Order created successfully!");
        // Reset form and generate new UUID
        formApi.reset();
        formApi.setFieldValue("userId", uuidv4());
      } catch (err) {
        alert("❌ Failed to create order.");
        console.error(err);
      }
    }

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
        {/* User ID (readonly) */}
        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">User ID</label>
          <form.Field
            name="userId"
            children={(field) => (
              <input
                className="border border-gray-300 rounded-md w-full p-3 bg-gray-100"
                value={field.state.value}
                readOnly
              />
            )}
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">Total Amount</label>
          <form.Field
            name="totalAmount"
            children={(field) => (
              <input
                type="number"
                className="border border-gray-300 rounded-md w-full p-3"
                placeholder="Enter Total Amount"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">Status</label>
          <form.Field
            name="status"
            children={(field) => (
              <select
                className="border border-gray-300 rounded-md w-full p-3"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              >
                <option value="Created">Created</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium text-lg text-gray-700">Description</label>
          <form.Field
            name="description"
            children={(field) => (
              <textarea
                className="border border-gray-300 rounded-md w-full p-3"
                placeholder="Enter description"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />
        </div>

        {/* Submit Button */}
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
