import { Saga } from "./saga";

export async function runOrderSaga(orderData: any) {
  const saga = new Saga([
    {
      name: "Create Order",
      action: async () => {
        console.log("✅ Creating order...");
        // You already created it earlier via POST /orders
        // Or here, insert into DB or just mark it done
      },
      compensation: async () => {
        console.log("↩️ Rolling back order...");
        // Delete order if something fails after
      },
    },
    {
      name: "Reserve Inventory",
      action: async () => {
        console.log("📦 Reserving inventory...");
        // Call Inventory service via HTTP or Kafka
      },
      compensation: async () => {
        console.log("↩️ Releasing inventory...");
        // Reverse inventory reservation
      },
    },
    {
      name: "Process Payment",
      action: async () => {
        console.log("💳 Processing payment...");
        // Call Payment API
      },
      compensation: async () => {
        console.log("↩️ Refunding payment...");
        // Refund logic
      },
    },
  ]);

  await saga.execute();
}
