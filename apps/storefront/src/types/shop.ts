export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  series: string;
  collectionSlug: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  badge?: string | null;
  finishes: string[];
  colors: string[];
  images: string[];
  featured: boolean;
  specs?: ProductSpec[] | null;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
}

export interface CartLine {
  product: Product;
  finish: string;
  quantity: number;
}
