"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import type { Product } from "@/types";

type Props = {
  pageTitle: string;
  pageSubtitle?: string;
  product: Product | null;
  onPrimaryCta?: () => void;
  primaryCtaText?: string;
};

export default function MonthlyHighlight({
  pageTitle,
  pageSubtitle,
  product,
  onPrimaryCta,
  primaryCtaText = "Own This Masterpiece",
}: Props) {
  const images = useMemo(() => {
    const list = (product?.images || []).filter(Boolean);
    if (list.length > 0) return list;
    if (product?.image_url) return [product.image_url];
    return [];
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length, product?.id]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <section className="max-w-[164em] mx-auto flex items-center flex-col min-h-screen py-2 snap-start relative pt-40">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full relative"
      >
        <motion.h1
          className="font-sans font-black text-4xl md:text-6xl lg:text-8xl text-center relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <span className="bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl">
            {pageTitle}
          </span>
          {pageSubtitle ? (
            <>
              <br />
              <motion.span
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent relative"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                    "0 0 40px rgba(251, 191, 36, 0.8)",
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {pageSubtitle}
              </motion.span>
            </>
          ) : null}

          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown className="w-12 h-12 md:w-16 md:h-16 text-amber-400 opacity-80" />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 blur-3xl -z-10 rounded-3xl" />
        </motion.h1>
      </motion.div>

      <div className="flex w-full flex-col md:flex-row md:justify-between gap-10 mt-20 px-5">
        <motion.div
          className="py-10 md:w-1/2 flex flex-col justify-center items-center text-center gap-5 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div
            className="absolute top-0 left-10"
            animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={20} className="text-amber-400 opacity-60" />
          </motion.div>

          <motion.h2
            className="font-sans font-bold text-3xl md:text-4xl lg:text-6xl bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            This Month&apos;s Highlight
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent blur-lg -z-10 rounded-lg"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="space-y-6"
          >
            <p className="font-mono text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed">
              Introducing our most celebrated piece — a masterpiece of craftsmanship and heritage.
              Designed with precision, ethically sourced gemstones, and a timeless aesthetic.
            </p>
            <p className="font-mono text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed">
              Available for a limited time, this exclusive design embodies the artistry and
              authenticity of the Royal Gems Institute.
            </p>
          </motion.div>

          {product ? (
            <motion.div
              className="flex justify-center py-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-60" />
                <motion.button
                  type="button"
                  onClick={onPrimaryCta}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-lg flex items-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Crown className="w-5 h-5 md:w-6 md:h-6" />
                  <span>{primaryCtaText}</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : null}
        </motion.div>

        <motion.div
          className="flex justify-center items-center md:w-1/2 relative"
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl scale-110" />

          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden w-full max-w-[520px]">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            />

            {product ? (
              <motion.div whileHover={{ scale: 1.05, rotateY: 5 }} transition={{ duration: 0.3 }} className="relative">
                <div className="relative rounded-2xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={images[activeIndex] || "empty"}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.35 }}
                      className="relative"
                    >
                      {images[activeIndex] ? (
                        // Using next/image here; ensure domains are configured for remote images.
                        <Image
                          src={images[activeIndex]}
                          alt={product.name}
                          width={520}
                          height={520}
                          className="rounded-2xl drop-shadow-2xl relative z-10 object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square rounded-2xl bg-white/5" />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Quick thumbnails */}
                  {images.length > 1 ? (
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center z-20">
                      {images.slice(0, 5).map((src, idx) => (
                        <button
                          key={src + idx}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={`h-2.5 w-2.5 rounded-full transition-all ${
                            idx === activeIndex ? "bg-amber-400" : "bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Show image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-4"
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <h3 className="text-white font-bold text-lg">{product.name}</h3>
                  <p className="text-slate-300 text-sm">Limited Edition Highlight</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-400 font-bold text-xl">
                      ${Number(product.price || 0).toLocaleString()}
                    </span>
                    {onPrimaryCta ? (
                      <motion.button
                        type="button"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-black px-3 py-1 rounded-lg text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onPrimaryCta}
                      >
                        View
                      </motion.button>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center text-slate-300">
                No highlight selected yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
