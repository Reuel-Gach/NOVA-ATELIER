// src/server/actions/inventory.ts
"use server"

import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createProduct(data: {
  name: string;
  slug: string;
  tier: "street_movement" | "core_collection" | "vip_executive";
  description: string;
  basePrice: number;
  imageUrls: { url: string; key: string }[];
}) {
  // 1. Insert the core product
  const [newProduct] = await db.insert(products).values({
    name: data.name,
    slug: data.slug,
    tier: data.tier,
    description: data.description,
    basePrice: data.basePrice.toString(),
  }).returning();

  // 2. Insert the associated images
  if (data.imageUrls.length > 0) {
    const imageRecords = data.imageUrls.map((img, index) => ({
      productId: newProduct.id,
      uploadthingKey: img.key,
      url: img.url,
      isPrimary: index === 0, 
      displayOrder: index,
    }));

    await db.insert(productImages).values(imageRecords);
  }

  // 3. Purge the cache so the storefront updates instantly
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, productId: newProduct.id };
}