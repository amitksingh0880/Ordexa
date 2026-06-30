import { createResource } from "./query";
import { SHOP } from "../constants/shop";
import type { Product, Collection } from "../types/shop";

export const products = createResource<Product>(SHOP.resources.products);
export const collections = createResource<Collection>(SHOP.resources.collections);
