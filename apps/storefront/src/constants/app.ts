export const APP = {
  name: "Ordexa",
  tagline: "The Future of Ethereal Design",
} as const;

export const ROUTES = {
  shop: "/",
  shopCollections: "/collections",
  shopProductPattern: "/products/$productId",
  shopProduct: (slug: string) => `/products/${slug}`,
} as const;

export const API = {
  crudBasePath: "/api",
} as const;

export const STORAGE_KEYS = {
  cart: "ordexa-shop-cart",
} as const;
