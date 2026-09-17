// src/app/(admin)/layout.tsx
"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Package, Activity, DollarSign, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 1. Get the current user's department from Clerk metadata
  const { user, isLoaded } = useUser();
  const department = user?.publicMetadata?.department as string | undefined;
  
  // 2. Define all routes with their required department mapping
  const allNavItems = [
    { name: "Inventory", path: "/admin/inventory", icon: Package, requiredDept: "inventory" },
    { name: "Finance", path: "/admin/finance", icon: DollarSign, requiredDept: "finance" },
    { name: "Citadel & VIP", path: "/admin/community", icon: Users, requiredDept: "community" },
    { name: "Technology", path: "/admin/technology", icon: Activity, requiredDept: "technology" },
  ];

  // 3. Filter the sidebar links based on authorization
  // Executives see everything. Regular admins only see their specific department.
  const navItems = allNavItems.filter(item => 
    department === "executive" || department === item.requiredDept
  );

  // Prevent UI flashing while Clerk determines the user's role
  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-alabaster)] dark:bg-[var(--color-obsidian)] text-[var(--color-obsidian)] dark:text-[var(--color-alabaster)] transition-colors duration-500">
      
      {/* Sleek, Minimal Sidebar */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[var(--color-gold)]/20 p-8 flex flex-col bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="mb-16">
          <Link href="/">
            <h2 className="font-editorial text-2xl font-bold uppercase tracking-widest">
              Nøva Atelier
            </h2>
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] mt-2 font-medium">
            Command Center
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`flex items-center gap-4 px-4 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]" 
                    : "text-[var(--color-obsidian)]/60 dark:text-[var(--color-alabaster)]/60 hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5"
                }`}
              >
                <Icon size={16} /> {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-[var(--color-gold)]/20 flex items-center gap-4">
          <UserButton 
            appearance={{ 
              elements: { avatarBox: "w-8 h-8 border border-[var(--color-gold)]/50 hover:border-[var(--color-gold)] transition-colors rounded-none" } 
            }} 
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold">Authorized</span>
            <span className="text-[10px] text-[var(--color-gold)] uppercase tracking-widest">
              {department === "executive" ? "Executive" : department || "Personnel"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}