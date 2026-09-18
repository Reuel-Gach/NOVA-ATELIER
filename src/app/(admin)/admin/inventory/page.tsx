// src/app/(admin)/admin/inventory/page.tsx
import { db } from "@/lib/db";
import { products, orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import DeployGarmentForm from "./DeployGarmentForm";
import { PackagePlus, LayoutGrid, ListOrdered, BarChart4 } from "lucide-react";

export default async function InventoryDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  // Await the Next.js 15 searchParams
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "deploy";

  // Fetch critical infrastructure data
  const inventory = await db.select().from(products).orderBy(desc(products.createdAt));
  const orderQueue = await db.select().from(orders).orderBy(desc(orders.createdAt));

  // Calculate live metrics
  const totalRevenue = orderQueue.reduce((acc, order) => acc + parseFloat(order.totalAmount || "0"), 0);
  const pendingOrders = orderQueue.filter(o => o.status === 'pending').length;

  const tabs = [
    { id: "deploy", name: "Deploy Garment", icon: PackagePlus },
    { id: "arsenal", name: "Current Arsenal", icon: LayoutGrid },
    { id: "queue", name: "Order Queue", icon: ListOrdered },
    { id: "pos", name: "POS & Performance", icon: BarChart4 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-editorial font-bold uppercase tracking-widest">
          Inventory & Logistics
        </h1>
        <div className="w-16 h-[1px] bg-[var(--color-gold)] mt-6"></div>
      </div>

      {/* Navigation Matrix */}
      <div className="flex border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 mb-12 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <Link 
              key={tab.id}
              href={`/admin/inventory?tab=${tab.id}`}
              className={`flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                isActive 
                  ? "border-b-2 border-[var(--color-gold)] text-[var(--color-gold)]" 
                  : "text-[var(--color-obsidian)]/50 dark:text-[var(--color-alabaster)]/50 hover:text-[var(--color-obsidian)] dark:hover:text-[var(--color-alabaster)]"
              }`}
            >
              <Icon size={16} /> {tab.name}
            </Link>
          );
        })}
      </div>

      {/* TIER 1: Deployment Engine */}
      {currentTab === "deploy" && <DeployGarmentForm />}

      {/* TIER 2: Active Inventory Tracker */}
      {currentTab === "arsenal" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-gold)]/30 text-[10px] uppercase tracking-widest text-[var(--color-gold)]">
                <th className="py-4 px-4">Garment Nomenclature</th>
                <th className="py-4 px-4">Operational Tier</th>
                <th className="py-4 px-4">Base Price</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10 hover:bg-[var(--color-obsidian)]/5 dark:hover:bg-[var(--color-alabaster)]/5 transition-colors">
                  <td className="py-4 px-4 font-medium">{item.name}</td>
                  <td className="py-4 px-4 text-[10px] uppercase tracking-widest opacity-70">{item.tier.replace("_", " ")}</td>
                  <td className="py-4 px-4 font-mono">KES {parseFloat(item.basePrice).toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TIER 3: Order Fulfillment Queue */}
      {currentTab === "queue" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-gold)]/30 text-[10px] uppercase tracking-widest text-[var(--color-gold)]">
                <th className="py-4 px-4">Order ID</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-4">Clearance Amount</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orderQueue.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[10px] uppercase tracking-widest opacity-50">No pending operations in queue</td>
                </tr>
              ) : (
                orderQueue.map(order => (
                  <tr key={order.id} className="border-b border-[var(--color-obsidian)]/10 dark:border-[var(--color-alabaster)]/10">
                    <td className="py-4 px-4 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest opacity-70">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-mono">KES {parseFloat(order.totalAmount).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TIER 4: POS & Analytics Performance */}
      {currentTab === "pos" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 border border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 bg-[var(--color-alabaster-200)]/20 dark:bg-[var(--color-obsidian-800)]/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2">Total Revenue Processed</h3>
              <p className="text-3xl font-editorial">KES {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-8 border border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 bg-[var(--color-alabaster-200)]/20 dark:bg-[var(--color-obsidian-800)]/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2">Pending Fulfillment</h3>
              <p className="text-3xl font-editorial">{pendingOrders} Dispatch(es)</p>
            </div>
            <div className="p-8 border border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 bg-[var(--color-alabaster-200)]/20 dark:bg-[var(--color-obsidian-800)]/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2">Arsenal Count</h3>
              <p className="text-3xl font-editorial">{inventory.length} Asset(s)</p>
            </div>
          </div>

          {/* POS Terminal Initialization */}
          <div className="p-8 border border-[var(--color-gold)]/30 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-gold)] mb-4">Point of Sale Terminal</h3>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-8 max-w-xl leading-relaxed">
                Hardware-accelerated interface for in-person cash and direct M-Pesa transaction logging. Awaiting barcode scanner initialization.
              </p>
              <button className="px-8 py-4 bg-[var(--color-obsidian)] text-[var(--color-alabaster)] dark:bg-[var(--color-alabaster)] dark:text-[var(--color-obsidian)] font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-opacity">
                Initialize Secure Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}