"use client";
import { useMemo, useState, useEffect } from "react";
import React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import { ShoppingCart } from "lucide-react";
import { CartItem, Product, Order } from "../../types";
import { dummyProducts } from "@/lib/data";
import { getProducts } from "@/utils/api";
import MonthlyHighlight from "@/components/MonthlyHighlight";

// Lazy load heavy components
const CollectionPage = dynamic(() => import("@/components/CollectionPage"));
const Cart = dynamic(() => import("@/components/Cart"));
const Checkout = dynamic(() => import("@/components/Checkout"));

function Page() {
  // const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState("collection");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getProducts();
    if (data) setProducts(data);
    else setProducts(dummyProducts); // Fallback to dummy data
  };

  // the function to cart
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const highlightProduct = useMemo(() => {
    return products.find((p) => p.is_month_highlight) || products[0] || null;
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Optimized background elements - Reduced animations for better performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating orbs - Simplified animations */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-amber-400/15 to-orange-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-l from-purple-400/15 to-pink-500/15 rounded-full blur-2xl"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-56 h-56 bg-gradient-to-br from-cyan-300/10 to-blue-400/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Reduced number of particles from 20 to 6 for better performance */}
        {[15, 35, 55, 75, 25, 65].map((left, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            style={{
              left: `${left}%`,
              top: `${(i * 35) % 100}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar relative z-10">
        {/* Floating shopping cart */}
        <motion.div
          className="fixed top-8 right-8 z-[1000]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            onClick={() => {
              setCurrentPage("cart");
              const section = document.getElementById("exquisite-collection-section");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-2xl"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity" />
            <ShoppingCart className="w-8 h-8 relative z-10" />
            <AnimatePresence>
              {cartItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        <MonthlyHighlight
          pageTitle="The Royal Gems"
          pageSubtitle="Collection"
          product={highlightProduct}
          onPrimaryCta={() => {
            setCurrentPage("collection");
            const section = document.getElementById("collections-section");
            if (section) section.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Enhanced Collections Section */}
        <section
          className="min-h-screen snap-start relative lg:h-screen pt-40"
          id="collections-section"
        >
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {currentPage === "collection" && (
                <motion.section
                  key="collection"
                  id="exquisite-collection-section"
                  className="min-h-screen snap-start"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.6 }}
                >
                  <CollectionPage products={products} onAddToCart={addToCart} />
                </motion.section>
              )}

              {currentPage === "cart" && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <Cart
                    items={cartItems}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onProceedToCheckout={() => setCurrentPage("checkout")}
                    onBackToCollection={() => setCurrentPage("collection")}
                  />
                </motion.div>
              )}

              {currentPage === "checkout" && (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* fetch order function may needed */}
                  <Checkout
                    items={cartItems}
                    onOrderComplete={() => {
                      clearCart();
                      setCurrentPage("collection");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pb-[400px]"></div>
        </section>
      </div>
    </div>
  );
}

export default Page;
