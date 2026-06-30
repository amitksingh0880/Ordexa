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

export interface CartItem {
  id: string;
  cartId: string;
  productSlug: string;
  name: string;
  series: string;
  price: number;
  currency: string;
  image: string;
  finish: string;
  quantity: number;
}

export interface OrderLine {
  productSlug: string;
  name: string;
  price: number;
  finish: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerName?: string | null;
  customerEmail?: string | null;
  items?: OrderLine[] | null;
  paymentStatus?: string | null;
  paymentId?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title?: string | null;
  body: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  body: string;
  status: string;
  createdAt: string;
}
