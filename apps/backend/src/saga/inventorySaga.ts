import { Saga } from "./saga";

export async function runInventorySaga(orderData: any) {
  const saga = new Saga([
    {
      name: "Reserve Inventory",
      action: async () => {
        console.log(`📦 Reserving inventory for order ${orderData.orderId}`);
        // Example: call inventory service or DB insert
        // throw new Error("simulate failure");
      },
      compensation: async () => {
        console.log("↩️ Releasing reserved inventory");
        // Reverse logic
      },
      maxRetries: 3,
      retryDelayMs: 500,
    },
  ], "InventorySaga");

  await saga.execute();
}
