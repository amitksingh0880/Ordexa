// Shared domain types for the Ordexa admin — single source of truth.

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
  description?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  items?: OrderLine[] | null;
  paymentStatus?: string | null;
  paymentId?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  available: number;
  reserved: number;
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
  featured: boolean;
  images: string[];
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
