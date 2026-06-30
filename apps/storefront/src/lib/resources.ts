import { createResource } from "./query";
import { SHOP } from "../constants/shop";
import type { Product, Collection, CartItem } from "../types/shop";

export const products = createResource<Product>(SHOP.resources.products);
export const collections = createResource<Collection>(SHOP.resources.collections);
export const cart = createResource<CartItem>(SHOP.resources.cart);
