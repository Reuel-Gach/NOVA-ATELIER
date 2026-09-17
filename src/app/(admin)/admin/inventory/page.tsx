// src/app/(admin)/admin/inventory/page.tsx
"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { createProduct } from "@/server/actions/inventory";

export default function InventoryDashboard() {
  const [images, setImages] = useState<{ url: string; key: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const rawName = formData.get("name") as string;
    
    try {
      await createProduct({
        name: rawName,
        slug: rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        tier: formData.get("tier") as any,
        description: formData.get("description") as string,
        basePrice: parseFloat(formData.get("price") as string),
        imageUrls: images,
      });

      alert("Garment Drop Scheduled Successfully");
      setImages([]);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert("Failed to deploy product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl font-editorial font-bold uppercase tracking-widest">
          Inventory Engine
        </h1>
        <div className="w-16 h-[1px] bg-[var(--color-gold)] mt-6"></div>
      </div>
      
      <form onSubmit={handleFormSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Garment Name */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">Garment Name</label>
            <input 
              name="name" 
              required 
              className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-obsidian)]/30 dark:placeholder:text-[var(--color-alabaster)]/30" 
              placeholder="e.g. Obsidian Heavyweight Hoodie" 
            />
          </div>
          
          {/* Base Price */}
          <div className="relative group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">Base Price (KES)</label>
            <input 
              type="number" 
              name="price" 
              required 
              min="0" 
              step="0.01" 
              className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-obsidian)]/30 dark:placeholder:text-[var(--color-alabaster)]/30" 
              placeholder="0.00" 
            />
          </div>
        </div>

        {/* Operational Tier */}
        <div className="relative group">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">Operational Tier</label>
          <select 
            name="tier" 
            required 
            className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors appearance-none cursor-pointer"
          >
            <option value="street_movement" className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)]">Street / Youth Movement</option>
            <option value="core_collection" className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)]">Core Collection</option>
            <option value="vip_executive" className="bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian-900)]">VIP / Executive Movement</option>
          </select>
        </div>

        {/* Description */}
        <div className="relative group">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2 block">Garment Specifications</label>
          <textarea 
            name="description" 
            required 
            rows={3} 
            className="w-full bg-transparent border-b border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 py-3 text-lg outline-none focus:border-[var(--color-gold)] transition-colors resize-none placeholder:text-[var(--color-obsidian)]/30 dark:placeholder:text-[var(--color-alabaster)]/30" 
            placeholder="Detail the architectural durability and precision..." 
          />
        </div>

        {/* Media */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] block">Media Assets</label>
          <div className="border border-dashed border-[var(--color-obsidian)]/20 dark:border-[var(--color-alabaster)]/20 hover:border-[var(--color-gold)] transition-colors p-2">
            <UploadDropzone
              endpoint="productImage"
              appearance={{
                button: "bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest px-8 py-3 hover:bg-[var(--color-gold-light)] transition-colors text-xs w-full md:w-auto",
                container: "border-none p-12",
                label: "text-[var(--color-obsidian)]/50 dark:text-[var(--color-alabaster)]/50 uppercase tracking-widest text-[10px] font-bold mt-4 hover:text-[var(--color-gold)] transition-colors",
                allowedContent: "hidden"
              }}
              onClientUploadComplete={(res) => {
                const uploadedImages = res.map(file => ({ url: file.url, key: file.key }));
                setImages(uploadedImages);
              }}
              onUploadError={(error: Error) => {
                alert(`Upload Error: ${error.message}`);
              }}
            />
          </div>
          {images.length > 0 && (
            <p className="text-[10px] text-[var(--color-gold)] mt-2 font-bold uppercase tracking-widest">
              {images.length} asset(s) staged for deployment.
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || images.length === 0}
          className="w-full md:w-auto px-12 py-5 bg-[var(--color-gold)] text-[var(--color-obsidian)] font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {isSubmitting ? "Committing to Database..." : "Deploy Garment"}
        </button>
      </form>
    </div>
  );
}