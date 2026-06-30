import { APP, ROUTES } from "./app";

export const SHOP = {
  brand: APP.name.toUpperCase(),
  signature: "Ordexa Ether",
  copyright: `© ${new Date().getFullYear()} ${APP.name.toUpperCase()} ETHER. ALL RIGHTS RESERVED.`,
  tagline:
    "Defining the intersection of strategic intelligence and modern editorial aesthetic.",

  resources: {
    products: "products",
    collections: "collections",
  },

  currency: { locale: "en-US", code: "USD" },

  nav: [
    { label: "Collections", to: ROUTES.shopCollections },
    { label: "New Arrivals", to: ROUTES.shopCollections },
    { label: "Essence", to: ROUTES.shopCollections },
    { label: "Journal", to: ROUTES.shop },
  ],

  hero: {
    eyebrow: "SS24 Collection",
    titleTop: "Luminous",
    titleBottom: "Ether",
    body: "Exploring the intersection of atmospheric depth and precision minimalism. A collection designed for strategic clarity.",
    primaryCta: "Explore Collection",
    secondaryCta: "Watch Film",
    floatingStatus: "Live Auction Status: Active",
  },

  featured: {
    eyebrow: "Featured Arrivals",
    subtitle: "Precision crafted essentials for the visionary mind.",
    viewAll: "View All Objects",
    limit: 4,
  },

  editorial: {
    eyebrow: "The Philosophy",
    title: "Creative Intelligence.",
    body: `At ${APP.name}, we believe design is not just visual—it's an operating system for the senses. We build objects that harmonize with the modern rhythm while injecting the soul of high-end editorial artistry.`,
    cta: "Read the Journal",
    quote:
      '"True clarity emerges when the noise is silenced and the essence is revealed."',
    quoteAuthor: `— Founder, ${APP.name} Ether`,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEotWdYh5QNY3Q6fXlkuFk2HBRRVPO9aFAZf138BELh-WHBnh-phMIg0yRkomkNgwCaer0GY8pILQ_CCeR6r11IIr6wveQzC_BTbaa4oJok67m1epf7g9uEQbiBdiQ-WtSEavM0TPvob6W0ZXhCmIYb7Nc40FSoBU9khHUhRX3kd-9ruuFcfNarkU2rr7PbkT1ltHnzvHCyV1RwCoRpi9vJg2EBdSgzrRMVKKi_PT4prWgLw9WUwclFRCH2OJB9ho0C0BWmiqgCvE",
  },

  newsletter: {
    title: `Join the ${APP.name} Circle.`,
    body: "Exclusive collection previews, strategic insights, and early access to archival releases.",
    placeholder: "ENTER YOUR EMAIL",
    success: "You're on the list.",
  },

  collectionsPage: {
    sortLabel: "Sort By",
    colorFilterLabel: "Color",
    seriesFilterLabel: "Series",
    curation: {
      title: "Curation Service",
      body: "Complimentary architectural consultations available for Essence Series orders.",
      cta: "Learn More",
    },
    emptyState: "No objects match the current selection.",
  },

  product: {
    chooseFinish: "Choose Finish",
    addToBag: "Add to Bag",
    findInStore: "Find in Store",
    reviewsSuffix: "REVIEWS",
    specTitle: "Technical Specification",
    relatedTitle: "Related Objects",
    relatedViewAll: "View All Collections",
    relatedLimit: 3,
    trustMarkers: [
      { icon: "truck", label: "Complimentary Shipping" },
      { icon: "shield", label: "2-Year Warranty" },
      { icon: "leaf", label: "Sustainably Sourced" },
    ],
  },

  cart: {
    title: "Shopping Bag",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingValue: "Calculated at checkout",
    total: "Total",
    checkout: "Checkout Now",
    checkoutNote: "Taxes and shipping calculated at payment step",
    empty: "Your bag is empty.",
    emptyCta: "Explore Collection",
    remove: "Remove",
  },

  footer: {
    groups: [
      {
        title: "Shop",
        links: [
          { label: "Collections", to: ROUTES.shopCollections },
          { label: "New Arrivals", to: ROUTES.shopCollections },
          { label: "Limited Edition", to: ROUTES.shopCollections },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Sustainability", to: ROUTES.shop },
          { label: "Contact", to: ROUTES.shop },
          { label: "Journal", to: ROUTES.shop },
        ],
      },
      {
        title: "Service",
        links: [
          { label: "Shipping", to: ROUTES.shop },
          { label: "Returns", to: ROUTES.shop },
          { label: "Privacy", to: ROUTES.shop },
        ],
      },
    ],
    systemStatus: "System Nominal",
  },
} as const;

export const formatPrice = (amount: number, currency = SHOP.currency.code): string =>
  new Intl.NumberFormat(SHOP.currency.locale, {
    style: "currency",
    currency,
  }).format(amount);
