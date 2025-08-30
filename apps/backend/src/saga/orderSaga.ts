// import { Saga } from "./saga";

// export async function runOrderSaga(orderData: any) {
//   const saga = new Saga([
//     {
//       name: "Create Order",
//       action: async () => {
//         console.log("✅ Creating order...");
//         // You already created it earlier via POST /orders
//         // Or here, insert into DB or just mark it done
//       },
//       compensation: async () => {
//         console.log("↩️ Rolling back order...");
//         // Delete order if something fails after
//       },
//     },
//     {
//       name: "Reserve Inventory",
//       action: async () => {
//         console.log("📦 Reserving inventory...");
//         // Call Inventory service via HTTP or Kafka
//       },
//       compensation: async () => {
//         console.log("↩️ Releasing inventory...");
//         // Reverse inventory reservation
//       },
//     },
//     {
//       name: "Process Payment",
//       action: async () => {
//         console.log("💳 Processing payment...");
//         // Call Payment API
//       },
//       compensation: async () => {
//         console.log("↩️ Refunding payment...");
//         // Refund logic
//       },
//     },
//   ]);

//   await saga.execute();
// }




import { Saga } from "./saga";

export async function runOrderSaga(orderData: any) {
  const saga = new Saga([
    {
      name: "Create Order",
      action: async () => {
        console.log("✅ Order already created in DB and outbox");
      },
      compensation: async () => {
        console.log("↩️ Rolling back order from DB...");
        // optional rollback logic
      },
    },
    {
      name: "Reserve Inventory",
      action: async () => {
        console.log("📦 Reserving inventory...");
        // Simulate call to inventory API
        // throw new Error("Inventory service unavailable");
      },
      compensation: async () => {
        console.log("↩️ Releasing inventory...");
      },
      maxRetries: 3,
      retryDelayMs: 500, // 0.5s → 1s → 2s
    },
    {
      name: "Process Payment",
      action: async () => {
        console.log("💳 Processing payment...");
        // Simulate call to payment service
      },
      compensation: async () => {
        console.log("↩️ Refunding payment...");
      },
      maxRetries: 3,
      retryDelayMs: 1000,
      timeoutMs: 5000,
    },
  ]);

  await saga.execute();
}
