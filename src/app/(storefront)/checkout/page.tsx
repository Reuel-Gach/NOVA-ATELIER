// src/app/(storefront)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store/useCart";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Smartphone, CreditCard, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { items, subtotal, removeItem } = useCart();
  const cartTotal = subtotal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMpesaCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: cartTotal,
          reference: `NOVA-${Math.floor(Math.random() * 100000)}`,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert("Please check your phone. An M-Pesa prompt has been sent.");
        // Logic to poll for payment success goes here
      } else {
        alert(`Payment failed: ${data.error}`);
      }
    } catch (error) {
      alert("A network error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
        <h1 className="font-editorial text-3xl mb-4">Your Bag is Empty</h1>
        <p className="text-[var(--color-obsidian)]/60 dark:text-[var(--color-alabaster)]/60 mb-8 uppercase tracking-widest text-xs">
          Return to the arsenal to secure your uniform.
        </p>
        <Link href="/" className="px-8 py-4 bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-gold-light)] transition-colors">
          Explore Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-editorial text-4xl uppercase tracking-widest">Secure Checkout</h1>
        <div className="w-16 h-[1px] bg-[var(--color-gold)] mt-6"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Order Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[var(--color-alabaster-200)]/30 dark:bg-[var(--color-obsidian-800)]/30 border border-[var(--color-gold)]/20 p-6 md:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-6 block">Order Summary</h2>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-6 items-center">
                  <div className="relative w-20 h-24 bg-[var(--color-alabaster-200)] dark:bg-[var(--color-obsidian-800)]">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-editorial text-lg text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)]">{item.name}</h3>
                    <p className="text-xs text-[var(--color-obsidian)]/60 dark:text-[var(--color-alabaster)]/60 uppercase tracking-widest mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                    <button onClick={() => removeItem(item.id, item.size)} className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold mt-2">Remove</button>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10">
              <div className="flex justify-between items-center text-xl">
                <span className="font-editorial">Total Investment</span>
                <span className="font-bold text-[var(--color-gold)]">KES {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Gateway */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)] border border-[var(--color-gold)] p-6 md:p-8 sticky top-32">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-6 block flex items-center gap-2">
              <ShieldCheck size={16} /> Encrypted Payment
            </h2>

            {/* Payment Method Toggle */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setPaymentMethod("mpesa")}
                className={`py-4 flex flex-col items-center justify-center gap-2 border transition-all ${
                  paymentMethod === "mpesa" 
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" 
                    : "border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 hover:border-[var(--color-gold)]"
                }`}
              >
                <Smartphone size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">M-Pesa</span>
              </button>
              <button 
                onClick={() => setPaymentMethod("card")}
                className={`py-4 flex flex-col items-center justify-center gap-2 border transition-all ${
                  paymentMethod === "card" 
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" 
                    : "border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 hover:border-[var(--color-gold)]"
                }`}
              >
                <CreditCard size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Global Card</span>
              </button>
            </div>

            {/* Dynamic Payment Form */}
            {paymentMethod === "mpesa" ? (
              <form onSubmit={handleMpesaCheckout} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">M-Pesa Phone Number</label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX or 2547XX..." 
                    className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-obsidian)]/30 dark:placeholder:text-[var(--color-alabaster)]/30" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest py-5 hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={18} /> Processing...</>
                  ) : (
                    "Authorize KES " + cartTotal.toLocaleString()
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--color-obsidian)]/60 dark:text-[var(--color-alabaster)]/60 uppercase tracking-widest mb-6 leading-relaxed">
                  Card processing infrastructure is currently being provisioned. Please utilize M-Pesa for immediate clearance.
                </p>
                <button 
                  onClick={() => setPaymentMethod("mpesa")}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] hover:text-[var(--color-gold-light)] underline underline-offset-4"
                >
                  Switch to M-Pesa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}