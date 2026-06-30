import { createResource } from "./query";
import { SHOP } from "../constants/shop";
import type {
  Product,
  Collection,
  CartItem,
  Order,
  Review,
  Message,
} from "../types/shop";

export const products = createResource<Product>(SHOP.resources.products);
export const collections = createResource<Collection>(SHOP.resources.collections);
export const cart = createResource<CartItem>(SHOP.resources.cart);
export const orders = createResource<Order>(SHOP.resources.orders);
export const reviews = createResource<Review>(SHOP.resources.reviews);
export const messages = createResource<Message>(SHOP.resources.messages);
