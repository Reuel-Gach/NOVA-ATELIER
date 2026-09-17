// src/app/(storefront)/products/[slug]/AddToCartView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/store/useCart";
import { ShoppingBag, Check } from "lucide-react";

interface ProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    description: string | null;
    basePrice: string;
  };
  images: { url: string; isPrimary: boolean | null }[];
}

export default function AddToCartView({ product, images }: ProductViewProps) {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [added, setAdded] = useState(false);
  
  const addItem = useCart((state) => state.addItem);
  const primaryImage = images.find(img => img.isPrimary)?.url || images[0]?.url || null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.basePrice),
      size: selectedSize,
      imageUrl: primaryImage,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Side: High-Res Image */}
        <div className="relative aspect-[3/4] w-full bg-[var(--color-alabaster-200)] dark:bg-[var(--color-obsidian-800)] border border-[var(--color-gold)]/20 overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="flex flex-col justify-center">
          <span className="text-xs text-[var(--color-gold)] font-bold uppercase tracking-[0.2em] mb-4">
            {product.tier.replace("_", " ")}
          </span>
          
          <h1 className="font-editorial text-4xl md:text-5xl text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)] mb-4">
            {product.name}
          </h1>
          
          <p className="text-xl font-medium text-[var(--color-obsidian)]/80 dark:text-[var(--color-alabaster)]/80 mb-8">
            KES {parseFloat(product.basePrice).toLocaleString()}
          </p>

          <div className="w-16 h-[1px] bg-[var(--color-gold)] mb-8"></div>

          <p className="text-[var(--color-obsidian)]/70 dark:text-[var(--color-alabaster)]/70 leading-relaxed mb-12">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="space-y-4 mb-12">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)]">
              Select Size: <span className="text-[var(--color-gold)]">{selectedSize}</span>
            </label>
            <div className="grid grid-cols-4 gap-4">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button 
                  key={size} 
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 border transition-all text-sm font-bold uppercase tracking-widest ${
                    selectedSize === size 
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-obsidian)]" 
                      : "border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 hover:border-[var(--color-gold)] text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest py-5 hover:bg-[var(--color-gold-light)] transition-colors flex items-center justify-center gap-3"
          >
            {added ? (
              <>
                <Check size={18} /> Secured in Bag
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}