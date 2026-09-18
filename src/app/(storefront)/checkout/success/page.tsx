// src/app/(storefront)/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Package } from "lucide-react";
import { useEffect, Suspense } from "react";
import { useCart } from "@/lib/store/useCart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const receipt = searchParams.get("receipt") || "Transaction Verified";
  const orderId = `NOVA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Optional: Automatically clear the cart from Zustand once they reach this page
  // const { removeAll } = useCart(); 
  // useEffect(() => { removeAll(); }, []);

  return (
    <div className="max-w-2xl mx-auto text-center border border-[var(--color-gold)]/20 bg-[var(--color-alabaster-200)]/30 dark:bg-[var(--color-obsidian-800)]/30 p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-gold)]"></div>
      
      <div className="flex justify-center mb-8">
        <CheckCircle2 size={64} className="text-[var(--color-gold)]" />
      </div>
      
      <h1 className="font-editorial text-4xl mb-2 text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)]">
        Payment Secured
      </h1>
      <p className="text-xs uppercase tracking-widest opacity-60 mb-8">
        Your acquisition has been logged into the Citadel network.
      </p>

      <div className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)] p-6 mb-8 text-left border border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10">
        <div className="flex justify-between items-center mb-4 border-b border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">Order Identifier</span>
          <span className="font-mono text-sm">{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">M-Pesa Receipt</span>
          <span className="font-mono text-sm">{receipt}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/" 
          className="w-full sm:w-auto px-8 py-4 bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-gold-light)] transition-colors"
        >
          Return to Arsenal
        </Link>
        <button className="w-full sm:w-auto px-8 py-4 border border-[var(--color-gold)] text-[var(--color-gold)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-gold)]/10 transition-colors flex items-center justify-center gap-2">
          <Download size={16} /> Save Receipt
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen pt-40 pb-24 px-6 flex items-center justify-center">
      <Suspense fallback={<div className="animate-pulse text-[var(--color-gold)]">Loading Receipt...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}