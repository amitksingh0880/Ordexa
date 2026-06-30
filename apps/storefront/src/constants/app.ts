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
  contact: "/contact",
  login: "/login",
  register: "/register",
  account: "/account",
} as const;

export const API = {
  crudBasePath: "/api",
  authBasePath: "/auth",
  paymentsBasePath: "/payments",
} as const;

export const PAYMENT_ENDPOINTS = {
  config: "/config",
  createOrder: "/razorpay/order",
  verify: "/razorpay/verify",
} as const;

export const AUTH_ENDPOINTS = {
  login: "/login",
  register: "/register",
  logout: "/logout",
  me: "/me",
  cartMerge: "/cart/merge",
} as const;

export const RESOURCE_NAMES = {
  addresses: "addresses",
} as const;

export const STORAGE_KEYS = {
  cartId: "ordexa-shop-cart-id",
  token: "ordexa-shop-token",
} as const;

export const AUTH_COPY = {
  signIn: "Sign in",
  signUp: "Create account",
  signOut: "Sign out",
  account: "Account",
  email: "Email",
  password: "Password",
  name: "Full name",
  haveAccount: "Already have an account?",
  noAccount: "New to Ordexa?",
  loginSubtitle: "Sign in to continue your order.",
  registerSubtitle: "Create an account to check out and track orders.",
  invalidCredentials: "Invalid email or password",
  registerFailed: "Could not create the account",
  profile: "Profile",
  orderHistory: "Order history",
  savedAddresses: "Saved addresses",
  addAddress: "Add address",
  noOrders: "You have not placed any orders yet.",
  noAddresses: "No saved addresses yet.",
  setDefault: "Set as default",
  defaultLabel: "Default",
  remove: "Remove",
} as const;

export const CHECKOUT_COPY = {
  signInRequired: "Sign in to check out",
  signInPrompt: "You need an account to place an order and track delivery.",
  contactStep: "Contact",
  addressStep: "Shipping address",
  deliveryMethod: "Delivery method",
  subtotal: "Subtotal",
  shipping: "Shipping",
  free: "Free",
  total: "Total",
  continueToAddress: "Continue",
  continueToPay: "Continue to payment",
  back: "Back",
} as const;

export const ADDRESS_FIELDS = {
  label: "Label (e.g. Home)",
  fullName: "Full name",
  phone: "Phone",
  line1: "Address line 1",
  line2: "Address line 2",
  city: "City",
  state: "State",
  postalCode: "Postal code",
  country: "Country",
} as const;
