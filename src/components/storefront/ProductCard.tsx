// src/components/storefront/ProductCard.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    basePrice: string;
    imageUrl: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayTier = product.tier.replace("_", " ").toUpperCase();

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)] border border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10 transition-all duration-500 group-hover:border-[var(--color-gold)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] overflow-hidden"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-alabaster-200)] dark:bg-[var(--color-obsidian-800)] border-b border-transparent group-hover:border-[var(--color-gold)]/30 transition-colors duration-500">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-obsidian)]/30 dark:text-[var(--color-alabaster)]/30">
              No Media Available
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 z-10 relative bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)] transition-colors duration-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-[var(--color-gold)] font-bold uppercase tracking-[0.2em]">
              {displayTier}
            </span>
          </div>
          
          <h3 className="font-editorial text-xl text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)] truncate mb-1 transition-colors duration-500">
            {product.name}
          </h3>
          
          <span className="font-sans text-sm font-medium text-[var(--color-obsidian)]/70 dark:text-[var(--color-alabaster)]/70 mb-6 transition-colors duration-500">
            KES {parseFloat(product.basePrice).toLocaleString()}
          </span>

          {/* Clean Action Button */}
          <div className="flex items-center justify-center gap-3 w-full py-3 border border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 group-hover:bg-[var(--color-gold)] group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-obsidian)] text-[var(--color-obsidian)]/70 dark:text-[var(--color-alabaster)]/70 transition-all duration-500">
            <ShoppingBag size={16} className="text-current" />
            <span className="text-xs font-bold uppercase tracking-widest">
              View & Select Size
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}