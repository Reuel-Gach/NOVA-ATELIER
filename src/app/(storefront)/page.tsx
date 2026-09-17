// src/app/(storefront)/page.tsx
import Hero from "@/components/storefront/Hero";
import ProductGrid from "@/components/storefront/ProductGrid";
import { Suspense } from "react";

export default function StorefrontHome() {
  return (
    <main className="min-h-screen">
      <Hero />
      
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-editorial text-3xl md:text-5xl text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)] mb-4 transition-colors duration-500">
            The Current Arsenal
          </h2>
          <div className="w-12 h-[1px] bg-[var(--color-gold)] mx-auto"></div>
          <p className="mt-6 max-w-2xl text-[var(--color-obsidian)]/70 dark:text-[var(--color-alabaster)]/70 uppercase tracking-widest text-xs font-medium transition-colors duration-500">
            Architectural durability engineered for the movement.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </section>
    </main>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col space-y-4">
          <div className="aspect-[3/4] bg-[var(--color-alabaster-200)]/50 dark:bg-[var(--color-obsidian-800)]/50" />
          <div className="h-3 w-16 bg-[var(--color-gold)]/20" />
          <div className="h-5 w-3/4 bg-[var(--color-alabaster-200)]/50 dark:bg-[var(--color-obsidian-800)]/50" />
          <div className="h-4 w-1/4 bg-[var(--color-alabaster-200)]/50 dark:bg-[var(--color-obsidian-800)]/50" />
        </div>
      ))}
    </div>
  );
}