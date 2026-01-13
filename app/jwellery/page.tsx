"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Product } from "../../types";
import { getJwelleryProducts } from "@/utils/api";

// Lazy load heavy components
const CollectionPage = dynamic(() => import("@/components/CollectionPage"));

export default function JwelleryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getJwelleryProducts();
      setProducts(data || []);
    })();
  }, []);

  return (
    <CollectionPage products={products} />
  );
}
