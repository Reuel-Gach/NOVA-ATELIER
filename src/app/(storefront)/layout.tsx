// src/app/(storefront)/layout.tsx
import Navbar from "@/components/storefront/Navbar";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* The children prop will render page.tsx (the Hero and Product Grid) */}
      {children}
    </>
  );
}