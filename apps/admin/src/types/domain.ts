// Shared domain types for the Ordexa admin — single source of truth.

export interface OrderLine {
  productSlug: string;
  name: string;
  price: number;
  finish: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
  shippingAddress?: ShippingAddress | null;
  shippingMethod?: string | null;
  shippingCost?: number | null;
  couponCode?: string | null;
  discount?: number | null;
  paymentStatus?: string | null;
  paymentId?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt?: string | null;
}

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt?: string;
}

export interface TenantOption {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

export interface TenantConfig {
  brand?: string;
  tagline?: string;
  currency?: string;
  shipping?: { flatRate?: number; freeThreshold?: number };
}

export interface Tenant extends TenantOption {
  config?: TenantConfig | null;
}

export interface AccessPermission {
  id: string;
  permissionName: string;
  resourceArn: string;
  description?: string | null;
  isActive: boolean;
}

export interface AccessRole {
  id: string;
  roleName: string;
  description?: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  assignedArns: string[];
}

export interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleIds: string[];
  orderCount: number;
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
  finishes?: string[];
  colors?: string[];
  images: string[];
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
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
