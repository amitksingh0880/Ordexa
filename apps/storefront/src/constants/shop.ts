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
    cart: "cart",
  },

  currency: { locale: "en-US", code: "USD" },

  nav: [
    { label: "Collections", to: ROUTES.shopCollections },
    { label: "New Arrivals", to: ROUTES.shopCollections },
    { label: "Essence", to: ROUTES.shopCollections },
    { label: "Journal", to: ROUTES.journal },
  ],

  hero: {
    eyebrow: "SS24 Collection",
    titleTop: "Luminous",
    titleBottom: "Ether",
    body: "Exploring the intersection of atmospheric depth and precision minimalism. A collection designed for strategic clarity.",
    primaryCta: "Explore Collection",
    secondaryCta: "Watch Film",
    floatingStatus: "Live Auction: Active",
  },

  featured: {
    kicker: "Curated Selection",
    eyebrow: "Featured Arrivals",
    subtitle: "Precision crafted essentials for the visionary mind.",
    viewAll: "View Complete Archive",
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
    eyebrow: "Membership",
    title: `Join the ${APP.name} Circle.`,
    body: "Exclusive collection previews, strategic insights, and early access to archival releases.",
    placeholder: "Enter your email address",
    success: "You're on the list.",
  },

  collectionsPage: {
    sortLabel: "Sort By",
    defaultSort: "featured",
    sortOptions: [
      { value: "featured", label: "Featured" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
    ],
    informedTitle: "Stay Informed.",
    informedBody:
      "Join our newsletter for exclusive access to upcoming Essence Series limited drops.",
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
    notFound: "Object not found.",
    backToShop: "Back to Collection",
    chooseFinish: "Choose Finish",
    addToBag: "Add to Bag",
    findInStore: "Find in Store",
    reviewsSuffix: "REVIEWS",
    specTitle: "Technical Specification",
    showcase: {
      title: "Precision of Silence.",
      body: "Experience a noise floor so low it creates a void, allowing every transient detail of your medium to emerge with uncompromised strategic clarity.",
      cta: "Explore Engineering",
    },
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
    checkoutSuccess: "Order placed — thank you.",
    addedToBag: "Added to your bag.",
    checkoutNote: "Taxes and shipping calculated at payment step",
    empty: "Your bag is empty.",
    emptyCta: "Explore Collection",
    remove: "Remove",
  },

  journal: {
    eyebrow: "The Journal",
    title: "Field Notes",
    intro:
      "Essays on precision minimalism, material studies, and the philosophy behind the Ordexa Ether system.",
    readMore: "Read Essay",
    entries: [
      {
        tag: "Philosophy",
        date: "March 2024",
        title: "The Architecture of Silence",
        excerpt:
          "How negative space and restraint became the foundation of the Essence collection.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBEotWdYh5QNY3Q6fXlkuFk2HBRRVPO9aFAZf138BELh-WHBnh-phMIg0yRkomkNgwCaer0GY8pILQ_CCeR6r11IIr6wveQzC_BTbaa4oJok67m1epf7g9uEQbiBdiQ-WtSEavM0TPvob6W0ZXhCmIYb7Nc40FSoBU9khHUhRX3kd-9ruuFcfNarkU2rr7PbkT1ltHnzvHCyV1RwCoRpi9vJg2EBdSgzrRMVKKi_PT4prWgLw9WUwclFRCH2OJB9ho0C0BWmiqgCvE",
      },
      {
        tag: "Materials",
        date: "February 2024",
        title: "Borosilicate & Light",
        excerpt:
          "A study of how the Series A shell refracts morning light into the workspace.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCt1jtoP_kRIKgcWTEuKMW-CnipjRU83zlyIAtIgbLc5euYH03fZXG9X-eMZ1aVUUraTkXVCT6Lco6hGi7UPphtSUnHlYVS5FT_7xC4zFUpiQjFvppTrq2fPZyRH2BHRAY1OygjHe2rwPaqtyoO2iJ573yv986XjcJhaxVIQgzEdRanj58m7_mkB20K8ertK6HQlDGQUQ2jfN74JcZMOeiLRuQaR7yEAUc9vhfUEzcDFnl3d8jBlovH0GdTRntMggOAWnMwmW6BNR8",
      },
      {
        tag: "Process",
        date: "January 2024",
        title: "Hand-glazing the Ether Vessel",
        excerpt:
          "Inside the studio where each iridescent vessel is finished by hand.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD9Dp7uWztUNIWkAtLehqihdaNHcvkXt78PI5QEshRlubissJA6BdMfWQFQw0fy6Pg1rw8Sj-WoMWVpnz2fHdZZredvNAE4ji__X-ZViDpNMR9e8iGi6bfqIUBnWoK67qd9UT8WHk2UrdaOIbhhxba2OXupu7Qy2TazGmu7WAKWlaqrU_7snb7OX5S8P9QGGCI_4W-Zv7UvLvd-SXwDJaOa0MBw1Et4AUjImi6pxsB3mtULPwBVji57vi3ze2smMJb3TEVoSzcvGfk",
      },
    ],
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
          { label: "Journal", to: ROUTES.journal },
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

export const formatPrice = (amount: number, currency: string = SHOP.currency.code): string =>
  new Intl.NumberFormat(SHOP.currency.locale, {
    style: "currency",
    currency,
  }).format(amount);
