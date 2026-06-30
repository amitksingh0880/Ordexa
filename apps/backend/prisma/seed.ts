import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const IMG = "https://lh3.googleusercontent.com/aida-public/";
const img = (token: string) => `${IMG}${token}`;

const collections = [
  {
    slug: "essence",
    name: "Essence",
    tagline: "Core Philosophy",
    description:
      "A definitive study in reduction. Each piece in the Essence collection represents our commitment to clarity, distilled through pure materials and strategic minimalism.",
  },
  {
    slug: "signature",
    name: "Signature Series",
    tagline: "The Flagship",
    description:
      "An intersection of architectural form and strategic utility, engineered through precision minimalism.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "The Supporting Cast",
    description:
      "Considered objects and companions that complete the Ordexa workspace.",
  },
];

const products = [
  {
    slug: "ordexa-series-a",
    name: "Ordexa Series A",
    series: "Signature Series",
    collectionSlug: "signature",
    description:
      "An intersection of architectural form and strategic utility. The Series A reimagines the acoustic landscape through precision minimalism, delivering high-fidelity resonance within a monolithic glass-morphic shell.",
    price: 1240,
    rating: 4.9,
    reviews: 128,
    badge: "Limited Edition",
    finishes: ["#000000", "#ffffff", "#D9D7D0"],
    colors: ["#000000", "#ffffff", "#D9D7D0"],
    featured: true,
    images: [
      img("AB6AXuCt1jtoP_kRIKgcWTEuKMW-CnipjRU83zlyIAtIgbLc5euYH03fZXG9X-eMZ1aVUUraTkXVCT6Lco6hGi7UPphtSUnHlYVS5FT_7xC4zFUpiQjFvppTrq2fPZyRH2BHRAY1OygjHe2rwPaqtyoO2iJ573yv986XjcJhaxVIQgzEdRanj58m7_mkB20K8ertK6HQlDGQUQ2jfN74JcZMOeiLRuQaR7yEAUc9vhfUEzcDFnl3d8jBlovH0GdTRntMggOAWnMwmW6BNR8"),
      img("AB6AXuBmF8zf5n3UzaD88qj2yLvUxsxHuJq36nLHgiFaPbLG96RqgAoDKpfilrcacR_cIX4L2zyqWx5d2ODabt-KqQDFCJ5yqKKAJaceh6W1yxBzegrE9__H0Z8OKAIO6oZy5kl6-C2N9kO6kl0ViJhPRk9NUbzD5NGibjRZFBBLaMnepAdNOMIegdAmllRxEi1LaBJmUGtCekOLSj5CIYFtam_v_1gx2xSwjUVk1Raj8-1pQ_rvfKaso9Efy0n_yRUJJoKMCfjqs-xJyPs"),
      img("AB6AXuDULa90fLAHTA9bKao8grobZAWeo1eoDjfaF5rZM00qlzS8VQaMZWQD1Fx9XbxjLCF7Rv_cT7Wp1FtWk8JRnMEOOo3pSqCrXPjUKPOwOXe-COAi_7r8if65sWlUbIbfZIp7yyMpENXjYAwGTJ0wp0zJKUWyfQWj3A1VzIQ6qJU1Og8FfJH-txP2OPV2dNri-cM3LqmCdps8JcMLsM_PeejxgucOnXpvTWowcguXL8hwyR02jnltBY1fq2cYW_1vEHPaRltmD_UVUK4"),
    ],
    specs: [
      { label: "Frequency", value: "32Hz – 22kHz" },
      { label: "Amplification", value: "400W Peak" },
      { label: "Dimensions", value: "240 x 310 mm" },
      { label: "Weight", value: "4.2 kg" },
      { label: "Material", value: "Borosilicate Glass" },
      { label: "Connectivity", value: "Ordexa Link v2" },
    ],
  },
  {
    slug: "ether-vessel-01",
    name: "Ether Vessel 01",
    series: "Atmospheric Ceramic",
    collectionSlug: "essence",
    description:
      "A sculptural ceramic vessel with an iridescent glaze, engineered to emphasise its curved silhouette under directional light.",
    price: 240,
    rating: 4.8,
    reviews: 64,
    badge: "New",
    finishes: ["#1b1b1b", "#E9E8E4"],
    colors: ["#1b1b1b", "#E9E8E4"],
    featured: true,
    images: [
      img("AB6AXuD9Dp7uWztUNIWkAtLehqihdaNHcvkXt78PI5QEshRlubissJA6BdMfWQFQw0fy6Pg1rw8Sj-WoMWVpnz2fHdZZredvNAE4ji__X-ZViDpNMR9e8iGi6bfqIUBnWoK67qd9UT8WHk2UrdaOIbhhxba2OXupu7Qy2TazGmu7WAKWlaqrU_7snb7OX5S8P9QGGCI_4W-Zv7UvLvd-SXwDJaOa0MBw1Et4AUjImi6pxsB3mtULPwBVji57vi3ze2smMJb3TEVoSzcvGfk"),
    ],
    specs: [],
  },
  {
    slug: "lumina-timepiece",
    name: "Lumina Timepiece",
    series: "Precision Horology",
    collectionSlug: "signature",
    description:
      "A translucent glass watch face with visible internal gears, balancing hairline borders with surgical precision.",
    price: 1150,
    rating: 4.9,
    reviews: 41,
    finishes: ["#000000", "#c8c6c5"],
    colors: ["#000000", "#c8c6c5"],
    featured: true,
    images: [
      img("AB6AXuDzRBJ2fMDS6pECJPG5NnVVXMc7Zhh-5CYOuBl_X7YRDw5y1lX31_VJTbK6X_WGq1YpCByJ3nHqb3dFoaz7njvvG68zKvDDniZLdEwtkNVxyWz5kCdH3vFFVnpS7L8O4GriN2UDT75p5OeF5FfzMB8Krd6DJHj8ll_kNLnuRgomq4LRpzsbKPQ5tcmevnF1nelEHCZPQVKV-iEYkvGSIf8eveUXtVU7Oj6WptJrI4aB-XDRxvRvoXBPLOlwCwy3lWRmcNCXwqkSHd0"),
    ],
    specs: [],
  },
  {
    slug: "void-lounge-chair",
    name: "Void Lounge Chair",
    series: "Structural Aluminum",
    collectionSlug: "essence",
    description:
      "A minimalist architectural chair in brushed aluminium with thin, sleek lines and deep cinematic shadows.",
    price: 3400,
    rating: 5,
    reviews: 22,
    finishes: ["#8C8880", "#D9D7D0"],
    colors: ["#8C8880", "#D9D7D0"],
    featured: true,
    images: [
      img("AB6AXuBXoOseSq-SzheErmwBuzZUWfNT86Zaege9uoJpgbWOxgnBFA1yz3nOPlqzaaPH6S0H_CIq8aPEydlbwQa1YrDI7RAyb6nO2MpPv_beFulJX5d9dFks5KKSfIpCYgVB73DBWp-jxWnW7LDIKmNd38R_1WauDc-Q9KA0R_OkPPu5I3keVEr74F0CxXq6uP3Ul8CkNgLj8GNZ402RThLowLkgcp-qRdKXgNSs5bBR9_NssXmfIa1Yxlemg66MvOwFimmq8hLZ-rCBIfE"),
    ],
    specs: [],
  },
  {
    slug: "ether-fragrance",
    name: "Ether Fragrance",
    series: "Olfactory Art",
    collectionSlug: "accessories",
    description:
      "A luxury fragrance housed in heavy crystal, refracting prism colour across a white satin surface.",
    price: 180,
    rating: 4.7,
    reviews: 88,
    finishes: ["#ffffff", "#ffb4a5"],
    colors: ["#ffffff", "#ffb4a5"],
    featured: true,
    images: [
      img("AB6AXuAvbjCQTMPmmAvPUo_4MmzF7WoxFj32KTyuHzxYtnzQxgsSQpRXHYekezAfqbOQ-3POnCDpn9a1UTZDVCsCPRWbEyF8J4z3WcfkyaG5FcIwN_6Bn3JQzKQqBg2zxHvRJptp5LfxuJEu71ro7LziCDfC0N3a4j530p9_m-GnPBB1I_ZJuOUmdz96lCtmq6IGTHFirzBG77Udr_0EVmq6HCsDDVqukSbKnKTWTGOq0WB1PLbrGzJD2qR0gC9JhcCqnxUtjJ6iI6frUTc"),
    ],
    specs: [],
  },
  {
    slug: "e1-void-vase",
    name: "E1 Void Vase",
    series: "Carbon Black Series",
    collectionSlug: "essence",
    description:
      "A matte black architectural vase on a raw stone pedestal, sculpted by sharp, directional light.",
    price: 420,
    rating: 4.8,
    reviews: 31,
    finishes: ["#000000"],
    colors: ["#000000"],
    images: [
      img("AB6AXuB9BhkVKgANT8TapDuQ5gUUB3swAFjANtxDTPHwH2x8tLugQ5OxzB628pNbIQ0xn0ECCWe2lt_Os1zlRZ29LkBDGyhlToxos9w231mj90oYrUoLlmx-0akgy7sSuxKNewjIBnnHk_0sPKh93Evhj77DdM2gMssT3aIEC8mDqkTwB_nGb593zTyL1GyyEFlV6yBfzDkB8KaZC3RmqU9Ut_Wm_jzMwCpX9FpbHbjBEexus8uypGUefPBy9PH69aEjkA5Li5NGZY3zvy8"),
    ],
    specs: [],
  },
  {
    slug: "orbital-light-02",
    name: "Orbital Light 02",
    series: "Studio Edition",
    collectionSlug: "essence",
    description:
      "A glass table lamp with a solid marble base and frosted spherical globe, soft and airy in a light-filled studio.",
    price: 1150,
    rating: 4.9,
    reviews: 54,
    finishes: ["#ffffff", "#D9D7D0"],
    colors: ["#ffffff", "#D9D7D0"],
    images: [
      img("AB6AXuAUvA2yaohj_zL8RNXFyGp50AkRdHKaEMFFcuDTrNrRiH_dqUErxqWJNYfI72HbabiQa21rkqoHevrX30h3vWhdlfE8j8yxvLaj59qdOmqxlkQ8NHGp4uHiwuswse4XAbGGK2odj5f913kxDAdLZ-qFjCgUeFdejzOlM1FYTlfXAWhmh-qsyTgLW8wElq8QcvpBjdJ-PXnAkq1AWooEOTRLyfM5zR03RGfbH-MCECRmrSWP7UvXRY0lZM527AO_UKNrT7ZyMWopRPw"),
    ],
    specs: [],
  },
  {
    slug: "axis-bookends",
    name: "Axis Bookends",
    series: "Precision Metal",
    collectionSlug: "essence",
    description:
      "Architectural bookends in solid brushed aluminium, catching light through sharp geometric angles.",
    price: 290,
    rating: 4.6,
    reviews: 19,
    finishes: ["#c8c6c5"],
    colors: ["#c8c6c5"],
    images: [
      img("AB6AXuAghPfhTUMPXoHZc61hXf7k68UqXMaZPrGgOyPFp2ZHKWM0Bs7JLdNh9FZ7LFdRpBpbITNfddApztBb4ARtYFIMDGXnqYYofDzMWTqTdhsrbxVoBcutpA5R-U-41r3NcfGUl6jmdgJnY5TdxdcrqcP-UiUp9e9f2Uz5bC3aISlKGrP2nCAD1lyLdTqRiePknhDgNA__BXKpPU4QMU9q_mw8nY_0woBFAX-5MGIKpnljohS5ifpmmtHbl9uez2arYJIiO30Ws4P8DDc"),
    ],
    specs: [],
  },
  {
    slug: "loom-throw",
    name: "Loom Throw",
    series: "Textile Series",
    collectionSlug: "essence",
    description:
      "A woven wool throw in ivory, draped over a walnut chair in a serene, light-filled living space.",
    price: 380,
    rating: 4.8,
    reviews: 73,
    finishes: ["#E9E8E4"],
    colors: ["#E9E8E4"],
    images: [
      img("AB6AXuA9Q9VAXNOEGJds4WhwbPSv7ERURdaWclSErDpPu0_Q9hgp6gilJwBESs31mtUeYcRx4Wu0woDKni4Eed9tLIQ3YmI_gwlX1rvZzd8UDEobvifwMzBKePIVVWhC5yoL94QVQsTEGJQj00VHnm5A3xUo53Zic8GjGNg45huy-M5OBT6BH4r8Sk5JGQ2jQuimILpb6zlJm7aygU1Yk4QISB32dl8fnDGbScqUSujtjiYG8hCkKcgKOmHkvt63pXTPS5732PjT9gyu_84"),
    ],
    specs: [],
  },
  {
    slug: "crystalline-set",
    name: "Crystalline Set",
    series: "Tactile Glass",
    collectionSlug: "essence",
    description:
      "A minimalist glass carafe and tumblers on a stainless tray, crisp with clear refractions.",
    price: 185,
    rating: 4.7,
    reviews: 47,
    finishes: ["#ffffff", "#D9D7D0"],
    colors: ["#ffffff", "#D9D7D0"],
    images: [
      img("AB6AXuAX9ZxVV_1PYev32fccQBjevGVF208Vd8vwiYmGLErIH-FNnkWp9Gl3DNFXOutTAiWZM49uWB4L7IpSPRGnGfWKEaZ_vFApO6oPWvpEeXAaDeJwttb26UebcOn6F3Mhh5I2q8jjNFM54J2F8Qx-fgai58k9sU6UDrC4PzGGNVndiaaMVAoJ-0ihdoow-3NtmSHUsbqPzwABfmrZ0Lz-Dkzs3rJzPtBSWdVIC16osIzWMUddrVhWydV26-yA5aIWgwjJMr5Boc3syLY"),
    ],
    specs: [],
  },
  {
    slug: "monolith-plinth",
    name: "Monolith Plinth",
    series: "Architectural Series",
    collectionSlug: "essence",
    description:
      "A solid oak low-profile plinth in a stark gallery setting, its grain detailed under high-contrast light.",
    price: 2400,
    rating: 5,
    reviews: 12,
    finishes: ["#8C8880"],
    colors: ["#8C8880"],
    images: [
      img("AB6AXuD-ttXomLcwbV_95I6xX2teksla9ooiiYGQoyrHlOIiwtD5jYXtMABH8qelaB_BbLJHUkrgu4CFFTacSOViO-14u4KX59vG_VknMwaufVmEJUzcHIMCtGXbjTeF6_Y7pbQ0mDnDDuW0gl8yKqDTU-AJJFgz2WQt5vlYlGzf7SvIHNwNE35VuMlyhANw7G2enoEDh1lbWpeI4AzaU4chuVK5UpRG_vcovzIO0uK1iK4fnwVJpQkUC9EMfc4GWXteJuYqTg80pSsHIFg"),
    ],
    specs: [],
  },
  {
    slug: "series-b-portable",
    name: "Series B Portable",
    series: "Acoustics",
    collectionSlug: "signature",
    description:
      "A smaller, equally refined monolithic device in deep charcoal, built for the mobile workspace.",
    price: 890,
    rating: 4.8,
    reviews: 96,
    finishes: ["#1b1b1b"],
    colors: ["#1b1b1b"],
    images: [
      img("AB6AXuBLslNDiDxMLZU0YgfX4lZd32mWfXkQg6ipL1KyX7ZaBdn3zrpLzbQ2QKz4uqABk1pzzgFkEWZoLfZx9a6Kf-6XUmsOgpWYlmEV3SgrRN-uAI4ZB2FTX5GP99hkC2JycwwkvSUT_aNa6HChGJ0xbpUIQNdX5vxiyROzJCKISxLq8_KhMKHuNVjQCBVv8l7yhJ-bTo-a1d3Vci_g14DYNfUA9OPVaA5yQzsICgXTHh_Rf9s6FkXlwNf6laySzuJDWM5rueHjnAguce0"),
    ],
    specs: [],
  },
  {
    slug: "essence-stand",
    name: "Essence Stand",
    series: "Accessories",
    collectionSlug: "accessories",
    description:
      "A sculptural chrome and carbon-fibre tripod stand for the Series A, finished to gallery standard.",
    price: 450,
    rating: 4.6,
    reviews: 28,
    finishes: ["#c8c6c5", "#1b1b1b"],
    colors: ["#c8c6c5", "#1b1b1b"],
    images: [
      img("AB6AXuAWhwf6ytz7ZPnbHmkhmi56PUsroFuUqo2yu1UAWBx9Sif4G1tw2a8xBKinXQNTXKGx-ZSWuTyYFjVbbOhpuE256pveQRP6T5ELbxW0MKvcmPHI_BX8tivCOupL0g61cNRMe-XGtUMZWvNkwteJE602e-yrmOgliDg3PsgICyyQjOXdcUuHCKm7syNUl9DSr-fI_B-hAhe30GHvN0PKNmRn2G-gIVVNjjBJxZ6y_4ke5R3xRoglgWcJyQDuwO5nYhKE6Iu5TGOZhzA"),
    ],
    specs: [],
  },
  {
    slug: "ordexa-journal-v01",
    name: "Ordexa Journal V.01",
    series: "Print",
    collectionSlug: "accessories",
    description:
      "A thick, beautifully bound hardcover volume with a minimalist cover, resting in a zen-like setting.",
    price: 120,
    rating: 4.9,
    reviews: 110,
    finishes: ["#1b1b1b"],
    colors: ["#1b1b1b"],
    images: [
      img("AB6AXuBZ1co900MRva6EbDxj4rgLGXZtkvOSqqfAbrX0FI9G18VtlBDtb3q9Z_X4JmoxOjLd_y90dryFAvtbIGa3DCzt1voXiYukAEBcHXTLBGErH3Th6te9wSXMX8IhJJlOECIcnHxH2rgs2ronxex5h_Wjr4b2VGD02a8B0mDW1Asj6zQLn_LSeI3uUk4tk9LGWd5XLQcShBhZa_7RdYAHe9ddKBJ2dgPYbPVPv-nedDS7QMPjIdw3XxoBVBQyFc4ua-MTPnj-Ix3BkCc"),
    ],
    specs: [],
  },
  {
    slug: "axis-desk-lamp",
    name: "Axis Desk Lamp",
    series: "Precision Metal",
    collectionSlug: "essence",
    description:
      "A matte black modernist desktop lamp with a slender hairline arm, photographed in clinical light.",
    price: 450,
    rating: 4.8,
    reviews: 37,
    finishes: ["#000000"],
    colors: ["#000000"],
    images: [
      img("AB6AXuDvGMT2fzHBCZdJwO2U_XPC4FUlIfyJYtzZcYs82Izopr2Rv9CmQF3DwNv7XxSsI3QrLdBRMKYCaX7BKQnnVv23xk3TvS67SwdiDfW9hO4JIYGKHmhupjSeu5y1qrnELC-KPp7Z14i6dh5kjGD6Kwf60TcuFv1DMmLmAVVpNOd_qqlclPnsZyFVXWqNI5T-yjm2x6GsBIi41zyUVpqRMwlRl0RBBMrPXOCmbaKucR4ioJJYHxrxP5FTCUh6lO29EmUXw9Djkcul-zI"),
    ],
    specs: [],
  },
  {
    slug: "vessel-no-04",
    name: "Vessel No. 04",
    series: "Atmospheric Ceramic",
    collectionSlug: "essence",
    description:
      "A textured ceramic bowl in warm cream with a hand-finished rough rim, shot under sharp light-and-shadow.",
    price: 120,
    rating: 4.7,
    reviews: 25,
    finishes: ["#E9E8E4"],
    colors: ["#E9E8E4"],
    images: [
      img("AB6AXuCiZtrtQmuk7-__Luqsg6KZmo3sa-_cxt9ogWlxXEkgNltL48nG4cYSTmgttTcRilhk5mTuVs_6uZnxHvWzvrD5-6chFKj_b6zJSAi39TLm49FAva9QxCkof4XFEto3zkf3hPmDZapdI8g3n07fvtu1l1R2QW4TaV9NkdeBW1tW6t69N4d9mvCWsRW10xYEoqN6krRerZYgLAFy0_qunCAw2LQDn5Yr86reXw1uL7L23071lHS-_GTby_MpxQFgtQf1mhdI-YJDlfU"),
    ],
    specs: [],
  },
  {
    slug: "the-ledger-noir",
    name: "The Ledger — Noir",
    series: "Print",
    collectionSlug: "accessories",
    description:
      "A premium linen journal with an embossed charcoal cover and black elastic strap, beside a fountain pen.",
    price: 65,
    rating: 4.9,
    reviews: 64,
    finishes: ["#1b1b1b"],
    colors: ["#1b1b1b"],
    images: [
      img("AB6AXuCBmuyhyMDKMZPWxSgdKRteU4jMEfa8i3Vf0Sf8dm6knuLZ7DRrXZKsEN1t9Twg3SHEmHrpajX9pa57xQ-eSKhgB8-wyk4zX6EsU0L-_HA1jGvxgEwIseESC_yy_wHvr7kKBrD3PSeipGZpIQwQWWff1hMt-NzwrgOS20zCIb6rEme-wbXA0byzyMt_SeJsQ-Nig7as-ZZuqOqPRNGNiEoKoG4jtUrWOUrS1zJsiL5QRKWPX8c7j1zuYmasQT20KqJ3gZvUYzvqFYc"),
    ],
    specs: [],
  },
];

async function main() {
  for (const c of collections) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // Mirror the catalog into the Inventory model so the admin dashboard tracks the
  // same products (sku = product slug) the storefront sells.
  for (const [index, p] of products.entries()) {
    const available = index === 3 ? 0 : ((index * 37) % 100) + 6;
    const inventory = {
      sku: p.slug,
      name: p.name,
      price: p.price,
      currency: p.currency ?? "USD",
      available,
      reserved: index % 4 === 0 ? 2 : 0,
    };
    await prisma.inventory.upsert({
      where: { sku: p.slug },
      update: inventory,
      create: inventory,
    });
  }

  const findP = (slug: string) => products.find((p) => p.slug === slug)!;
  const line = (slug: string, finish: string, quantity: number) => {
    const p = findP(slug);
    return { productSlug: p.slug, name: p.name, price: p.price, finish, quantity };
  };
  const day = 24 * 60 * 60 * 1000;

  const orders = [
    { id: "seed-order-1", status: "Pending", customerName: "Aria Chen", customerEmail: "aria@example.com", items: [line("ether-vessel-01", "#1b1b1b", 1), line("ordexa-journal-v01", "#1b1b1b", 2)], daysAgo: 0 },
    { id: "seed-order-2", status: "Pending", customerName: "Marcus Hale", customerEmail: "marcus@example.com", items: [line("lumina-timepiece", "#000000", 1)], daysAgo: 1 },
    { id: "seed-order-3", status: "Confirmed", customerName: "Sofia Reyes", customerEmail: "sofia@example.com", items: [line("orbital-light-02", "#ffffff", 1), line("crystalline-set", "#ffffff", 1)], daysAgo: 2 },
    { id: "seed-order-4", status: "Shipped", customerName: "Liam Novak", customerEmail: "liam@example.com", items: [line("void-lounge-chair", "#8C8880", 1)], daysAgo: 4 },
    { id: "seed-order-5", status: "Delivered", customerName: "Noor Abadi", customerEmail: "noor@example.com", items: [line("ether-fragrance", "#ffffff", 2)], daysAgo: 7 },
    { id: "seed-order-6", status: "Delivered", customerName: "Elena Fischer", customerEmail: "elena@example.com", items: [line("ordexa-series-a", "#000000", 1)], daysAgo: 9 },
    { id: "seed-order-7", status: "Cancelled", customerName: "Tom Becker", customerEmail: "tom@example.com", items: [line("axis-desk-lamp", "#000000", 1)], daysAgo: 11 },
    { id: "seed-order-8", status: "Pending", customerName: "Mira Patel", customerEmail: "mira@example.com", items: [line("loom-throw", "#E9E8E4", 1), line("vessel-no-04", "#E9E8E4", 1)], daysAgo: 0 },
  ];
  for (const o of orders) {
    const totalAmount = o.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const paid =
      ["Confirmed", "Shipped", "Delivered"].includes(o.status) || o.id === "seed-order-1";
    const base = {
      userId: o.id,
      status: o.status,
      totalAmount,
      currency: "USD",
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      items: o.items,
      paymentStatus: paid ? "Paid" : "Unpaid",
      paymentMethod: paid ? "Razorpay" : null,
      paymentId: paid ? `pay_${o.id.replace("seed-order-", "seed")}` : null,
      createdAt: new Date(Date.now() - o.daysAgo * day),
    };
    await prisma.order.upsert({ where: { id: o.id }, update: base, create: { id: o.id, ...base } });
  }

  const reviews = [
    { id: "seed-review-1", productSlug: "ordexa-series-a", author: "Elena Fischer", rating: 5, title: "Sublime", body: "The resonance is unreal — fills the room without effort.", status: "Published" },
    { id: "seed-review-2", productSlug: "ordexa-series-a", author: "Marcus Hale", rating: 4, title: "Beautiful object", body: "Gorgeous design, a touch pricey but worth it.", status: "Published" },
    { id: "seed-review-3", productSlug: "ether-vessel-01", author: "Aria Chen", rating: 5, title: "Centerpiece", body: "The glaze catches light through the whole day.", status: "Published" },
    { id: "seed-review-4", productSlug: "lumina-timepiece", author: "Noor Abadi", rating: 5, title: null, body: "Precision you can feel.", status: "Pending" },
    { id: "seed-review-5", productSlug: "void-lounge-chair", author: "Liam Novak", rating: 4, title: null, body: "Sculptural and surprisingly comfortable.", status: "Pending" },
  ];
  for (const r of reviews) {
    const { id, ...rest } = r;
    await prisma.review.upsert({ where: { id }, update: rest, create: r });
  }

  const messages = [
    { id: "seed-msg-1", name: "Priya Nair", email: "priya@example.com", subject: "Bulk order enquiry", body: "Do you offer trade pricing for 10+ Series A units?", status: "Unread" },
    { id: "seed-msg-2", name: "Hugo Martin", email: "hugo@example.com", subject: "Shipping to EU", body: "What are the lead times for delivery to France?", status: "Unread" },
    { id: "seed-msg-3", name: "Dana Lee", email: "dana@example.com", subject: "Warranty", body: "Is the 2-year warranty transferable?", status: "Read" },
    { id: "seed-msg-4", name: "Sam Okoro", email: "sam@example.com", subject: "Press request", body: "I'd love to feature the Essence collection in our magazine.", status: "Unread" },
  ];
  for (const m of messages) {
    const { id, ...rest } = m;
    await prisma.message.upsert({ where: { id }, update: rest, create: m });
  }

  console.log(
    `✅ Seeded ${collections.length} collections, ${products.length} products, ${products.length} inventory items, ${orders.length} orders, ${reviews.length} reviews, ${messages.length} messages`,
  );
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
