// src/components/storefront/Hero.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-obsidian/60 dark:bg-obsidian/80" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-gold uppercase tracking-[0.3em] text-sm md:text-base font-medium mb-6"
        >
          The Uniform of the Movement
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-editorial text-5xl md:text-7xl lg:text-8xl text-alabaster leading-tight mb-8"
        >
          Quiet Authority.<br /> Undeniable Presence.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            href="/core"
            className="px-8 py-4 bg-gold text-obsidian font-bold uppercase tracking-widest text-sm hover:bg-gold-light transition-colors"
          >
            Explore Core Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}