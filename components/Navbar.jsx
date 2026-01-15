"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Diamond, Crown } from "lucide-react";

function Navbar() {
  // Always show compact navbar
  const [isOpen, setIsOpen] = useState(false);

  // No scroll/collapse logic needed

  // Navigation items with icons
  const navItems = [
    { name: "Home", href: "/", icon: <Crown size={22.4} /> },
    { name: "Gems", href: "/gems", icon: <Diamond size={22.4} /> },
    { name: "Jewellery", href: "/jewellery", icon: <Crown size={22.4} /> },
    { name: "Academy", href: "/academy", icon: <Sparkles size={22.4} /> },
    { name: "About", href: "/about", icon: <Crown size={22.4} /> },
  ];

  const shouldShowCompact = true;

  return (
    <div className="relative">
      {/* Navbar Container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className={`static top-0 left-0 w-full z-50 transition-all duration-500 bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900`}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-2xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-l from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 30, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Always show compact navbar */}
        <div className="py-[1.05rem] relative z-10">
          <div className="max-w-[168em] mx-auto px-6 sm:px-12 md:px-24 lg:px-40 flex items-center justify-between">
            {/* Compact Logo - Left Side */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Crown size={39.2} className="text-amber-400" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[1.96rem] font-bold bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent leading-tight">
                  Royal Gems
                </span>
                <span className="text-lg font-medium text-amber-400 leading-tight">
                  Institute
                </span>
              </div>
            </motion.div>

            {/* Compact Navigation - Right Side */}
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center space-x-7">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-200 relative px-5 py-3 rounded-xl"
                    >
                      <span className="text-amber-400 group-hover:text-amber-300 transition-colors text-[1.4em]">
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap font-semibold text-lg">
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile menu button */}
              <motion.button
                className="md:hidden flex items-center justify-center w-14 h-14 text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.95 }}
              >
                {isOpen ? (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 pb-4 space-y-1 font-nav">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-amber-400 group-hover:text-amber-300 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        &rarr;
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Removed dynamic spacer below navbar */}
    </div>
  );
}

export default Navbar;
