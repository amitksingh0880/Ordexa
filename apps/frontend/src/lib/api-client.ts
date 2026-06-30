import axios from "axios";
import { API_BASE_URL } from "./api";
import { API_PATHS } from "../constants/app";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  InventoryListResponse,
  OrderListResponse,
} from "../types/domain";

// Single axios instance for every backend call. Base URL comes from config
// (VITE_API_URL); paths come from the centralized API_PATHS map.
const http = axios.create({ baseURL: API_BASE_URL });

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  const { data } = await http.post<CreateOrderResponse>(API_PATHS.createOrder, input);
  return data;
}

export async function getOrdersByUser(userId: string): Promise<OrderListResponse> {
  const { data } = await http.get<OrderListResponse>(API_PATHS.ordersByUser(userId));
  return data;
}

export async function getInventory(): Promise<InventoryListResponse> {
  const { data } = await http.get<InventoryListResponse>(API_PATHS.inventory);
  return data;
}
