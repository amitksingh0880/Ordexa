import { createResource } from "./query";
import { RESOURCES } from "../constants/app";
import type {
  Product,
  Collection,
  Order,
  InventoryItem,
  Review,
  Message,
  Coupon,
} from "../types/domain";

export const products = createResource<Product>(RESOURCES.products);
export const collections = createResource<Collection>(RESOURCES.collections);
export const orders = createResource<Order>(RESOURCES.orders);
export const inventory = createResource<InventoryItem>(RESOURCES.inventory);
export const reviews = createResource<Review>(RESOURCES.reviews);
export const messages = createResource<Message>(RESOURCES.messages);
export const coupons = createResource<Coupon>(RESOURCES.coupons);
