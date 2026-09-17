// src/app/(storefront)/products/[slug]/page.tsx
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductClientView from "./ProductClientView";

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch the exact product by URL slug on the server
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  // 2. Fetch all associated images on the server
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id));

  // 3. Pass data down to the client component
  return <ProductClientView product={product} images={images} />;
}