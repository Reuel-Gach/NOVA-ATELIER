// src/app/(storefront)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store/useCart";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Smartphone, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [phone, setPhone] = useState("");
  
  // Real-time Payment States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForPin, setIsWaitingForPin] = useState(false);
  
  const { items, subtotal, removeItem } = useCart();
  const cartTotal = subtotal();
  const router = useRouter();

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
      
      if (data.success && data.data.CheckoutRequestID) {
        setIsWaitingForPin(true);
        startStatusPolling(data.data.CheckoutRequestID);
      } else {
        alert(`Payment initialization failed: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      alert("A network error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const startStatusPolling = (checkoutRequestId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?checkoutRequestId=${checkoutRequestId}`);
        const statusData = await res.json();

        if (statusData.status === "paid") {
          clearInterval(interval);
          // Assuming you have a clearCart function in Zustand, or we bypass for now
          router.push(`/checkout/success?receipt=${encodeURIComponent(statusData.receipt || "Confirmed")}`);
        } else if (statusData.status === "cancelled") {
          clearInterval(interval);
          setIsWaitingForPin(false);
          setIsProcessing(false);
          alert("Payment was cancelled. Please try again.");
        } else if (statusData.status === "failed") {
          clearInterval(interval);
          setIsWaitingForPin(false);
          setIsProcessing(false);
          alert("Payment failed.");
        }
        // If 'pending', the interval simply runs again in 3 seconds
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 3000); // Poll every 3 seconds
  };

  if (!mounted) return null;

  if (items.length === 0 && !isWaitingForPin) {
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

        {/* Right Column: Payment Gateway / Loading Screen */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)] border border-[var(--color-gold)] p-6 md:p-8 sticky top-32">
            
            {isWaitingForPin ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-pulse">
                <Smartphone size={48} className="text-[var(--color-gold)]" />
                <div>
                  <h3 className="font-editorial text-2xl mb-2">Check Your Phone</h3>
                  <p className="text-xs uppercase tracking-widest opacity-70 leading-relaxed">
                    An M-Pesa STK push has been sent to {phone}.<br/>Please enter your PIN to authorize KES {cartTotal.toLocaleString()}.
                  </p>
                </div>
                <Loader2 className="animate-spin text-[var(--color-gold)]" size={32} />
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-bold">Awaiting Callback...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-6 block flex items-center gap-2">
                  <ShieldCheck size={16} /> Encrypted Payment
                </h2>

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

                {paymentMethod === "mpesa" ? (
                  <form onSubmit={handleMpesaCheckout} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">M-Pesa Phone Number</label>
                      <input 
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX" 
                        className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-obsidian)]/30 dark:placeholder:text-[var(--color-alabaster)]/30" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest py-5 hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <><Loader2 className="animate-spin" size={18} /> Initializing...</>
                      ) : (
                        "Authorize KES " + cartTotal.toLocaleString()
                      )}
                    </button>
                  </form>
                ) : (
                   <div className="text-center py-8">
                     <p className="text-sm opacity-60 uppercase tracking-widest mb-6 leading-relaxed">
                       Card processing infrastructure is currently being provisioned. Please utilize M-Pesa.
                     </p>
                   </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}