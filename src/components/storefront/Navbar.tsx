// src/components/storefront/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingBag, Search, Menu, ShieldAlert, Sun, Moon } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useCart } from "@/lib/store/useCart";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { isLoaded, isSignedIn, user } = useUser();
  const department = user?.publicMetadata?.department as string | undefined;
  
  const adminRoute = department === "executive" ? "/admin/inventory" : `/admin/${department}`;
  const totalItems = useCart((state) => state.totalItems());

  // Prevent hydration mismatch for theme and persisted local storage states
  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        isScrolled 
          ? "bg-[var(--color-alabaster)]/90 dark:bg-[var(--color-obsidian)]/90 backdrop-blur-md border-b border-[var(--color-gold)]/20 text-[var(--color-obsidian)] dark:text-white" 
          : "bg-transparent text-[var(--color-obsidian)] dark:text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="md:hidden flex-1">
          <Menu className="w-6 h-6 hover:text-[var(--color-gold)] transition-colors cursor-pointer" />
        </div>

        {/* Brand Logo */}
        <Link href="/" className="flex-1 md:flex-none text-center md:text-left">
          <h1 className="font-editorial text-2xl md:text-3xl tracking-widest font-bold uppercase">
            Nøva Atelier
          </h1>
        </Link>

        {/* Desktop Navigation Spacer (Reserved for future category upgrades) */}
        <div className="hidden md:flex flex-1 justify-center"></div>

        {/* Utilities */}
        <div className="flex flex-1 justify-end items-center gap-5 md:gap-6">
          <Search className="w-5 h-5 hover:text-[var(--color-gold)] transition-colors cursor-pointer hidden md:block" />
          
          {/* Theme Toggle Button */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:text-[var(--color-gold)] transition-colors focus:outline-none"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          
          {isLoaded && isSignedIn && department && (
            <Link href={adminRoute} title="Command Center">
              <ShieldAlert className="w-5 h-5 text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors" />
            </Link>
          )}

          {isLoaded && isSignedIn ? (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border-2 border-[var(--color-gold)]/50 hover:border-[var(--color-gold)] transition-colors"
                }
              }} 
            />
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs uppercase tracking-widest font-bold hover:text-[var(--color-gold)] transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}

          <Link href="/checkout" className="relative group">
            <ShoppingBag className="w-5 h-5 group-hover:text-[var(--color-gold)] transition-colors" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-gold)] text-[var(--color-obsidian)] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}