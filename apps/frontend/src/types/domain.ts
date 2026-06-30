// Shared domain types for the Ordexa UI — single source of truth.

export interface InventoryItem {
  sku: string;
  name: string;
  available: number;
  reserved: number;
}

export interface Order {
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
}

export interface OrderListResponse {
  orders: Order[];
  limit?: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
}

export interface CreateOrderInput {
  userId: string;
  totalAmount: number;
  sku: string;
  quantity: number;
  description?: string;
}

export interface CreateOrderResponse {
  isError: boolean;
  message?: string;
  orderId?: string;
  status?: string;
  errorMessage?: string;
}
