import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  integer, 
  decimal, 
  boolean, 
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// ENUMS (Based on Brand & Tech Guidelines)
// ==========================================
export const tierEnum = pgEnum("tier", ["street_movement", "core_collection", "vip_executive"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["mpesa", "card"]);
export const trackingStatusEnum = pgEnum("tracking_status", [
  "order_placed", 
  "fabric_allocation", 
  "tailoring", 
  "quality_assurance", 
  "shipped", 
  "delivered"
]);

// ==========================================
// USERS (Synced via Clerk Webhook)
// ==========================================
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isCitadelMember: boolean("is_citadel_member").default(false), // VIP Access Pass
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// CATALOG & INVENTORY
// ==========================================
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tier: tierEnum("tier").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  color: text("color").notNull(),
  sku: text("sku").notNull().unique(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0), // For 15-min checkout locks
});

// Add this right above your Relations block in src/lib/db/schema.ts
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  uploadthingKey: text("uploadthing_key").notNull(),
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  displayOrder: integer("display_order").default(0),
});
// ==========================================
// ORDERS & TRANSACTIONS
// ==========================================
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id), // Enforces account requirement
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentReference: text("payment_reference"), // M-Pesa Receipt or Stripe Charge ID
  shippingAddress: text("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});

// ==========================================
// SHIPPING & CUSTOMER TRACKING
// ==========================================
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  trackingNumber: text("tracking_number").unique(),
  status: trackingStatusEnum("status").default("order_placed").notNull(),
  carrier: text("carrier"), 
  estimatedDelivery: timestamp("estimated_delivery"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// RELATIONS (For efficient querying)
// ==========================================
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  shipment: one(shipments, { fields: [orders.id], references: [shipments.orderId] }),
}));