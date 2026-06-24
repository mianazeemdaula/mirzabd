// lib/wc-formatters.ts
import { Prisma } from "@prisma/client";
import Decimal = Prisma.Decimal;

/**
 * Format a DB Category into WooCommerce JSON API format
 */
export function formatWcCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent: category.parentId || 0,
    description: category.description || "",
    image: category.imageUrl ? { src: category.imageUrl } : null,
    menu_order: category.displayOrder || 0,
    count: category.count || 0,
  };
}

/**
 * Format a DB Product (with categories, tags, and variations) into WooCommerce JSON API format
 */
export function formatWcProduct(product: any) {
  const regularPrice = product.regularPrice instanceof Decimal ? product.regularPrice.toNumber() : Number(product.regularPrice || 0);
  const salePrice = product.salePrice instanceof Decimal ? product.salePrice.toNumber() : product.salePrice ? Number(product.salePrice) : null;
  const onSale = salePrice !== null && salePrice < regularPrice;
  const currentPrice = onSale ? salePrice : regularPrice;

  // Format images
  let images: any[] = [];
  if (product.images) {
    try {
      images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
    } catch (e) {
      images = [];
    }
  }

  // Format attributes
  let attributes: any[] = [];
  if (product.attributes) {
    try {
      attributes = typeof product.attributes === "string" ? JSON.parse(product.attributes) : product.attributes;
    } catch (e) {
      attributes = [];
    }
  }

  // Extract meta data
  const metaData = [
    { id: 1, key: "isbn", value: product.isbn || "" },
    { id: 2, key: "author", value: product.author || "" },
    { id: 3, key: "publisher", value: product.publisher || "" },
    { id: 4, key: "publish_year", value: product.publishYear ? String(product.publishYear) : "" },
    { id: 5, key: "pages", value: product.pages ? String(product.pages) : "" },
    { id: 6, key: "language", value: product.language || "English" },
  ];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    permalink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/books/${product.slug}`,
    type: product.type || "simple",
    status: product.status || "publish",
    featured: product.isFeatured || false,
    catalog_visibility: "visible",
    description: product.description || "",
    short_description: product.shortDescription || "",
    sku: product.sku || "",
    price: String(currentPrice),
    regular_price: String(regularPrice),
    sale_price: salePrice ? String(salePrice) : "",
    date_on_sale_from: null,
    date_on_sale_to: null,
    price_html: onSale 
      ? `<del><span class="woocommerce-Price-amount amount">Rs. ${regularPrice}</span></del> <ins><span class="woocommerce-Price-amount amount">Rs. ${salePrice}</span></ins>` 
      : `<span class="woocommerce-Price-amount amount">Rs. ${regularPrice}</span>`,
    on_sale: onSale,
    purchasable: true,
    total_sales: product.totalSales || 0,
    virtual: false,
    downloadable: false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    external_url: "",
    button_text: "",
    tax_status: "taxable",
    tax_class: "",
    manage_stock: product.manageStock || false,
    stock_quantity: product.stockQuantity,
    stock_status: product.stockStatus || "instock",
    backorders: "no",
    backorders_allowed: false,
    backordered: false,
    sold_individually: false,
    weight: product.weight ? String(product.weight) : "",
    dimensions: { length: "", width: "", height: "" },
    shipping_required: true,
    shipping_taxable: true,
    shipping_class: "",
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: String(product.averageRating || 0),
    rating_count: product.ratingCount || 0,
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: 0,
    purchase_note: "",
    categories: (product.categories || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    tags: (product.tags || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    })),
    images: images.map((img: any, index: number) => ({
      id: img.id || index + 1,
      src: img.src,
      name: img.alt || product.name,
      alt: img.alt || product.name,
    })),
    attributes: attributes.map((attr: any) => ({
      name: attr.name,
      position: 0,
      visible: attr.visible !== undefined ? attr.visible : true,
      variation: attr.variation !== undefined ? attr.variation : false,
      options: attr.options || [],
    })),
    default_attributes: [],
    variations: (product.variations || []).map((v: any) => v.id),
    grouped_products: [],
    menu_order: 0,
    meta_data: metaData,
  };
}

/**
 * Parse WooCommerce REST API product data into Prisma input values.
 */
export function parseWcProduct(wcData: any) {
  // Read fields from WC structure
  const name = wcData.name;
  const slug = wcData.slug || "";
  const type = wcData.type || "simple";
  const status = wcData.status || "publish";
  const description = wcData.description || "";
  const shortDescription = wcData.short_description || "";
  const sku = wcData.sku || null;
  const regularPrice = wcData.regular_price ? new Decimal(wcData.regular_price) : new Decimal(0);
  const salePrice = wcData.sale_price ? new Decimal(wcData.sale_price) : null;
  
  const manageStock = wcData.manage_stock || false;
  const stockQuantity = wcData.stock_quantity !== undefined ? Number(wcData.stock_quantity) : null;
  const stockStatus = wcData.stock_status || "instock";
  const weight = wcData.weight ? new Decimal(wcData.weight) : null;
  const isFeatured = wcData.featured || false;

  // Images mapping
  const images = (wcData.images || []).map((img: any, idx: number) => ({
    id: img.id || idx + 1,
    src: img.src,
    alt: img.alt || img.name || "",
    position: idx,
  }));

  // Attributes mapping
  const attributes = (wcData.attributes || []).map((attr: any) => ({
    name: attr.name,
    options: attr.options || [],
    visible: attr.visible !== undefined ? attr.visible : true,
    variation: attr.variation !== undefined ? attr.variation : false,
  }));

  // Extract meta data
  let isbn: string | null = null;
  let author: string | null = null;
  let publisher: string | null = null;
  let publishYear: number | null = null;
  let pages: number | null = null;
  let language = "English";

  if (wcData.meta_data && Array.isArray(wcData.meta_data)) {
    for (const item of wcData.meta_data) {
      if (item.key === "isbn") isbn = item.value;
      else if (item.key === "author") author = item.value;
      else if (item.key === "publisher") publisher = item.value;
      else if (item.key === "publish_year" && item.value) publishYear = Number(item.value);
      else if (item.key === "pages" && item.value) pages = Number(item.value);
      else if (item.key === "language") language = item.value;
    }
  }

  return {
    name,
    slug,
    type,
    status,
    description,
    shortDescription,
    sku,
    regularPrice,
    salePrice,
    manageStock,
    stockQuantity,
    stockStatus,
    weight,
    isFeatured,
    images: images, // JSON field
    attributes: attributes, // JSON field
    isbn,
    author,
    publisher,
    publishYear,
    pages,
    language,
  };
}

/**
 * Format a DB Order into WooCommerce JSON API format
 */
export function formatWcOrder(order: any) {
  const subtotal = order.subtotal instanceof Decimal ? order.subtotal.toNumber() : Number(order.subtotal);
  const total = order.total instanceof Decimal ? order.total.toNumber() : Number(order.total);
  const discount = order.discount instanceof Decimal ? order.discount.toNumber() : Number(order.discount || 0);
  const shippingCost = order.shippingCost instanceof Decimal ? order.shippingCost.toNumber() : Number(order.shippingCost || 0);
  const tax = order.tax instanceof Decimal ? order.tax.toNumber() : Number(order.tax || 0);

  // Map database status to WC order status
  let wcStatus = "pending";
  switch (order.status) {
    case "PENDING":
      wcStatus = "pending";
      break;
    case "PROCESSING":
      wcStatus = "processing";
      break;
    case "SHIPPED":
      wcStatus = "on-hold"; // or processing, on-hold is custom mapped
      break;
    case "DELIVERED":
      wcStatus = "completed";
      break;
    case "CANCELLED":
      wcStatus = "cancelled";
      break;
    case "REFUNDED":
      wcStatus = "refunded";
      break;
  }

  // Parse JSON addresses
  let billing = { first_name: "", last_name: "", address_1: "", city: "", state: "", postcode: "", country: "", email: "", phone: "" };
  let shipping = { first_name: "", last_name: "", address_1: "", city: "", state: "", postcode: "", country: "" };
  try {
    const b = typeof order.billingAddress === "string" ? JSON.parse(order.billingAddress) : order.billingAddress;
    if (b) {
      const names = (b.name || "").split(" ");
      billing = {
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || "",
        address_1: b.address || "",
        city: b.city || "",
        state: b.state || "",
        postcode: b.zip || "",
        country: b.country || "Pakistan",
        email: b.email || order.guestEmail || "",
        phone: b.phone || "",
      };
    }
  } catch {}

  try {
    const s = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress;
    if (s) {
      const names = (s.name || "").split(" ");
      shipping = {
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || "",
        address_1: s.address || "",
        city: s.city || "",
        state: s.state || "",
        postcode: s.zip || "",
        country: s.country || "Pakistan",
      };
    }
  } catch {}

  return {
    id: order.id,
    parent_id: 0,
    number: order.orderNumber,
    order_key: `wc_order_${order.id}`,
    created_via: "checkout",
    version: "3.0.0",
    status: wcStatus,
    currency: order.currency || "PKR",
    date_created: order.createdAt.toISOString(),
    date_created_gmt: order.createdAt.toISOString(),
    date_modified: order.updatedAt.toISOString(),
    date_modified_gmt: order.updatedAt.toISOString(),
    discount_total: String(discount),
    discount_tax: "0.00",
    shipping_total: String(shippingCost),
    shipping_tax: "0.00",
    cart_tax: "0.00",
    total: String(total),
    total_tax: String(tax),
    prices_include_tax: false,
    customer_id: order.userId || 0,
    customer_note: order.notes || "",
    billing,
    shipping,
    payment_method: order.paymentMethod,
    payment_method_title: order.paymentMethod === "stripe" ? "Credit Card (Stripe)" : "Cash on Delivery",
    transaction_id: order.stripePaymentId || "",
    date_paid: order.paymentStatus === "PAID" ? order.updatedAt.toISOString() : null,
    date_paid_gmt: order.paymentStatus === "PAID" ? order.updatedAt.toISOString() : null,
    date_completed: order.status === "DELIVERED" ? order.updatedAt.toISOString() : null,
    date_completed_gmt: order.status === "DELIVERED" ? order.updatedAt.toISOString() : null,
    line_items: (order.items || []).map((item: any) => {
      const price = item.price instanceof Decimal ? item.price.toNumber() : Number(item.price);
      const totalItem = item.total instanceof Decimal ? item.total.toNumber() : Number(item.total);
      return {
        id: item.id,
        name: item.name,
        product_id: item.productId,
        variation_id: item.variationId || 0,
        quantity: item.quantity,
        tax_class: "",
        subtotal: String(totalItem),
        subtotal_tax: "0.00",
        total: String(totalItem),
        total_tax: "0.00",
        taxes: [],
        meta_data: [],
        sku: item.sku || "",
        price,
      };
    }),
  };
}

/**
 * Format a DB User into WooCommerce Customer format
 */
export function formatWcCustomer(user: any) {
  // Find default or first address
  let billing = { first_name: "", last_name: "", address_1: "", city: "", state: "", postcode: "", country: "", email: user.email, phone: user.phone || "" };
  let shipping = { first_name: "", last_name: "", address_1: "", city: "", state: "", postcode: "", country: "" };

  const defaultAddr = (user.addresses || []).find((a: any) => a.isDefault) || user.addresses?.[0];
  if (defaultAddr) {
    const names = (defaultAddr.name || user.name || "").split(" ");
    const fName = names[0] || "";
    const lName = names.slice(1).join(" ") || "";
    billing = {
      first_name: fName,
      last_name: lName,
      address_1: defaultAddr.address,
      city: defaultAddr.city,
      state: defaultAddr.state || "",
      postcode: defaultAddr.zip || "",
      country: defaultAddr.country || "Pakistan",
      email: user.email,
      phone: defaultAddr.phone || user.phone || "",
    };
    shipping = {
      first_name: fName,
      last_name: lName,
      address_1: defaultAddr.address,
      city: defaultAddr.city,
      state: defaultAddr.state || "",
      postcode: defaultAddr.zip || "",
      country: defaultAddr.country || "Pakistan",
    };
  } else {
    const names = (user.name || "").split(" ");
    const fName = names[0] || "";
    const lName = names.slice(1).join(" ") || "";
    billing.first_name = fName;
    billing.last_name = lName;
    shipping.first_name = fName;
    shipping.last_name = lName;
  }

  return {
    id: user.id,
    date_created: user.createdAt.toISOString(),
    date_created_gmt: user.createdAt.toISOString(),
    date_modified: user.updatedAt.toISOString(),
    date_modified_gmt: user.updatedAt.toISOString(),
    email: user.email,
    first_name: billing.first_name,
    last_name: billing.last_name,
    role: user.role === "ADMIN" ? "administrator" : "customer",
    username: user.email,
    billing,
    shipping,
    is_paying_customer: (user.orders || []).some((o: any) => o.paymentStatus === "PAID"),
    avatar_url: user.image || "",
  };
}
