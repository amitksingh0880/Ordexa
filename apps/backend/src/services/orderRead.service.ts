// apps/backend/src/services/OrderReadService.ts

import { getOrdersByUserId, type OrderRow } from "../../utils/select";

export class OrderReadService {
  async fetchUserOrders(userId: string, limit = 10, offset = 0): Promise<OrderRow[]> {
    if (!userId || typeof userId !== "string" || !/^[0-9a-f-]{36}$/.test(userId)) {
      console.error("Invalid userId:", userId);
      return [];
    }

    try {
      const orders = await getOrdersByUserId(userId, limit, offset);
      return orders;
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      return [];
    }
  }
}
