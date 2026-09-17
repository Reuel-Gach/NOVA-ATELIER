// src/lib/db/seed.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { products, productImages } from './schema';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedStorefront() {
  console.log("⏳ Seeding Nova Atelier Database...");

  try {
    // 1. Street / Youth Movement Product
    const [streetGarment] = await db.insert(products).values({
      name: "Obsidian Heavyweight Hoodie",
      slug: "obsidian-heavyweight-hoodie",
      tier: "street_movement",
      description: "A 500gsm oversized hoodie built for the digital citadel. Features a dropped shoulder and architectural durability.",
      basePrice: "6500",
    }).returning();

    await db.insert(productImages).values({
      productId: streetGarment.id,
      uploadthingKey: "unsplash_placeholder_1",
      url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      isPrimary: true,
    });

    // 2. Core Collection Product
    const [coreGarment] = await db.insert(products).values({
      name: "Alabaster Minimalist Jacket",
      slug: "alabaster-minimalist-jacket",
      tier: "core_collection",
      description: "Engineered for continuous motion. A lightweight, water-resistant outer shell with subtle gold accents.",
      basePrice: "12000",
    }).returning();

    await db.insert(productImages).values({
      productId: coreGarment.id,
      uploadthingKey: "unsplash_placeholder_2",
      url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
      isPrimary: true,
    });

    // 3. VIP / Executive Movement Product
    const [vipGarment] = await db.insert(products).values({
      name: "The Citadel Executive Suit",
      slug: "citadel-executive-suit",
      tier: "vip_executive",
      description: "Magnificent craftsmanship with zero detail spared. Tailored from Italian wool for elite international spaces.",
      basePrice: "45000",
    }).returning();

    await db.insert(productImages).values({
      productId: vipGarment.id,
      uploadthingKey: "unsplash_placeholder_3",
      url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      isPrimary: true,
    });

    console.log("✅ Storefront successfully seeded with public mock data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  }
}

seedStorefront();