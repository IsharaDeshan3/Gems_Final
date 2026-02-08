"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/FooterPage";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import { Product } from "../../types";
import { getJewelleryProducts } from "@/utils/api";
import MonthlyHighlight from "@/components/MonthlyHighlight";

// Lazy load heavy components
const CollectionPage = dynamic(() => import("@/components/CollectionPage"));

export default function JewelleryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getJewelleryProducts();
      setProducts(data || []);
    })();
  }, []);

  const highlightProduct = useMemo(() => {
    const selected = products.find((p) => p.is_month_highlight);
    return selected || products[0] || null;
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background elements (matches Gems page vibe) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-amber-400/15 to-orange-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-l from-purple-400/15 to-pink-500/15 rounded-full blur-2xl"
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">
        <MonthlyHighlight
          pageTitle="The Royal Jewellery"
          pageSubtitle="Collection"
          product={highlightProduct}
          onPrimaryCta={() => {
            const section = document.getElementById("jewellery-collection-section");
            section?.scrollIntoView({ behavior: "smooth" });
          }}
          primaryCtaText="Explore This Highlight"
        />

        <section className="min-h-screen pt-20" id="jewellery-collection-section">
          <CollectionPage products={products} />
          <div className="pb-[220px]" />
        </section>
      </div>
      <Footer />
    </div>
  );
}
