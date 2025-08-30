// import { prisma } from "../lib/prisma";
// import { randomUUID } from "crypto";
// import type { components } from "../types/api";

// type OrderInput = components["schemas"]["OrderInput"];

// export class OrderService {
//   async createOrder(input: OrderInput): Promise<{ id: string } | undefined> {
//     const isValid = this.validateInput(input);
//     if (!isValid) {
//       console.error("❌ Invalid OrderInput:", input);
//       return undefined;
//     }

//     const orderId = randomUUID();
//     const eventId = randomUUID();
//     const now = new Date();

//     try {
//       const [order] = await prisma.$transaction([
//         prisma.order.create({
//           data: {
//             id: orderId,
//             userId: input.userId,
//             status: "Created",
//             totalAmount: input.totalAmount,
//           },
//         }),
//         prisma.outboxEvent.create({
//           data: {
//             id: eventId,
//             aggregateId: orderId,
//             aggregateType: "Order",
//             eventType: "OrderCreated",
//             payload: {
//               userId: input.userId,
//               status: "Created",
//               totalAmount: input.totalAmount,
//               createdAt: now,
//             },
//           },
//         }),
//       ]);

//       return { id: order.id };
//     } catch (error) {
//       console.error("❌ Error creating order:", error);
//       return undefined;
//     }
//   }

//   private validateInput(input: any): input is OrderInput {
//     return (
//       input &&
//       typeof input.userId === "string" &&
//       /^[0-9a-f-]{36}$/.test(input.userId) &&
//       typeof input.totalAmount === "number" &&
//       input.totalAmount > 0
//     );
//   }
// }





import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";
import type { components } from "../types/api";
import { runOrderSaga } from "../saga/orderSaga";

type OrderInput = components["schemas"]["OrderInput"];

export class OrderService {
  async createOrder(input: OrderInput): Promise<{ id: string } | undefined> {
    const isValid = this.validateInput(input);
    if (!isValid) {
      console.error("❌ Invalid OrderInput:", input);
      return undefined;
    }

    const orderId = randomUUID();
    const eventId = randomUUID();
    const now = new Date();

    try {
      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            id: orderId,
            userId: input.userId,
            status: "Created",
            totalAmount: input.totalAmount,
          },
        }),
        prisma.outboxEvent.create({
          data: {
            id: eventId,
            aggregateId: orderId,
            aggregateType: "Order",
            eventType: "OrderCreated",
            payload: {
              userId: input.userId,
              status: "Created",
              totalAmount: input.totalAmount,
              createdAt: now,
            },
          },
        }),
      ]);

      // ✅ Trigger distributed Saga orchestration
      await runOrderSaga({
        orderId,
        userId: input.userId,
        totalAmount: input.totalAmount,
        createdAt: now.toISOString(),
      });

      return { id: order.id };
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return undefined;
    }
  }

  private validateInput(input: any): input is OrderInput {
    return (
      input &&
      typeof input.userId === "string" &&
      /^[0-9a-f-]{36}$/.test(input.userId) &&
      typeof input.totalAmount === "number" &&
      input.totalAmount > 0
    );
  }
}
