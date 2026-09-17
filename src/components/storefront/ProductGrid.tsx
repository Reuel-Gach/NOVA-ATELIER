// src/components/storefront/ProductGrid.tsx
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  tierFilter?: "street_movement" | "core_collection" | "vip_executive";
}

export default async function ProductGrid({ tierFilter }: ProductGridProps) {
  // 1. Fetch products from Neon DB
  let query = db.select().from(products);
  if (tierFilter) {
    query.where(eq(products.tier, tierFilter));
  }
  const fetchedProducts = await query.orderBy(desc(products.createdAt));

  if (fetchedProducts.length === 0) {
    return (
      <div className="text-center py-24 text-[var(--color-obsidian)]/50 dark:text-[var(--color-alabaster)]/50 uppercase tracking-widest text-xs">
        No operational assets deployed in this tier yet.
      </div>
    );
  }

  // 2. Fetch primary images for these products
  const productIds = fetchedProducts.map(p => p.id);
  const images = await db.select().from(productImages);

  // 3. Map images to their respective products
  const productsWithImages = fetchedProducts.map(product => {
    const primaryImg = images.find(img => img.productId === product.id && img.isPrimary) || 
                       images.find(img => img.productId === product.id);
    return {
      ...product,
      imageUrl: primaryImg ? primaryImg.url : null,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
      {productsWithImages.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}