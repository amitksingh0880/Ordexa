export const APP = {
  name: "Ordexa",
  tagline: "The Future of Ethereal Design",
} as const;

export const ROUTES = {
  shop: "/",
  shopCollections: "/collections",
  shopProductPattern: "/products/$productId",
  shopProduct: (slug: string) => `/products/${slug}`,
  journal: "/journal",
} as const;

export const API = {
  crudBasePath: "/api",
} as const;

export const STORAGE_KEYS = {
  cartId: "ordexa-shop-cart-id",
} as const;
