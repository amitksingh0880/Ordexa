import { createResource } from "./query";
import { authHttp } from "./http";
import { SHOP } from "../constants/shop";
import { RESOURCE_NAMES } from "../constants/app";
import type {
  Product,
  Collection,
  CartItem,
  Order,
  Review,
  Message,
  Address,
  WishlistItem,
} from "../types/shop";

export const products = createResource<Product>(SHOP.resources.products);
export const collections = createResource<Collection>(SHOP.resources.collections);
export const cart = createResource<CartItem>(SHOP.resources.cart);
export const orders = createResource<Order>(SHOP.resources.orders);
export const reviews = createResource<Review>(SHOP.resources.reviews);
export const messages = createResource<Message>(SHOP.resources.messages);

// Addresses live under the auth router; the same factory drives them via authHttp.
export const addresses = createResource<Address>(RESOURCE_NAMES.addresses, authHttp);
export const wishlist = createResource<WishlistItem>(RESOURCE_NAMES.wishlist);
