"use client";
import React from "react";
import Footer from "@/components/FooterPage";
import { motion } from "framer-motion";
import {
  Crown,
  Diamond,
  Award,
  Users,
  Globe,
  BookOpen,
  Shield,
  Sparkles,
  Heart,
  Target,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const AboutPage = () => {
  const stats = [
    { number: "2000+", label: "Years of Heritage", icon: Crown },
    { number: "50,000+", label: "Certified Gemstones", icon: Diamond },
    { number: "10,000+", label: "Happy Clients", icon: Users },
    { number: "500+", label: "Graduates Trained", icon: BookOpen },
  ];

  const values = [
    {
      icon: Shield,
      title: "Authenticity",
      description:
        "Every gemstone is certified and guaranteed authentic with full documentation",
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "World-class standards in gemology, education, and customer service",
      color: "from-amber-400 to-orange-400",
    },
    {
      icon: Heart,
      title: "Integrity",
      description:
        "Transparent pricing, honest assessments, and ethical sourcing practices",
      color: "from-red-400 to-pink-400",
    },
    {
      icon: Globe,
      title: "Innovation",
      description:
        "Blending ancient wisdom with modern technology and teaching methods",
      color: "from-purple-400 to-indigo-400",
    },
  ];

  const milestones = [
    {
      year: "1924",
      event: "Founded in Colombo",
      detail: "Established as a family gem trading business",
    },
    {
      year: "1975",
      event: "International Recognition",
      detail: "Became Sri Lanka's premier gem institute",
    },
    {
      year: "1995",
      event: "Academy Launch",
      detail: "Started professional gemology training programs",
    },
    {
      year: "2010",
      event: "Global Expansion",
      detail: "Opened branches in major cities worldwide",
    },
    {
      year: "2020",
      event: "Digital Transformation",
      detail: "Launched online courses and virtual consultations",
    },
    {
      year: "2024",
      event: "Innovation Hub",
      detail: "State-of-the-art gem research facility opened",
    },
  ];

  const team = [
    {
      name: "Dr. Chandrika Perera",
      role: "Chief Gemologist",
      credentials: "PhD Gemology, GIA Master",
      specialty: "Sapphire & Ruby Expert",
    },
    {
      name: "Rohan Fernando",
      role: "Director of Education",
      credentials: "FGA, DGA Certified",
      specialty: "Gemology Training",
    },
    {
      name: "Priya Jayasinghe",
      role: "Head of Appraisals",
      credentials: "Certified Appraiser",
      specialty: "Rare Gem Valuation",
    },
    {
      name: "Kumar Wickramasinghe",
      role: "Master Jeweler",
      credentials: "35 Years Experience",
      specialty: "Custom Design",
    },
  ];

  const certifications = [
    "Gemological Institute of America (GIA)",
    "Swiss Gemmological Institute SSEF",
    "Gübelin Gem Lab",
    "Asian Institute of Gemological Sciences (AIGS)",
    "International Gemological Institute (IGI)",
    "American Gem Society (AGS)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => {
          const leftPos = (i * 39) % 100;
          const topPos = (i * 27) % 100;
          const duration = (i % 6) + 8;
          const delay = (i % 10) * 0.5;

          return (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-gradient-to-r from-amber-300 to-purple-400 rounded-full"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] bg-gradient-to-r from-amber-400/15 to-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 text-center max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <motion.div
              className="inline-block"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Crown size={80} className="text-amber-400 mx-auto" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-8rem md:text-12rem font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent"
          >
            Royal Gem & Jewellery Hub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2.4rem md:text-3.2rem text-slate-300 mb-8 leading-relaxed"
          >
            Where 2000 Years of Sri Lankan Gem Heritage
            <br />
            Meets World-Class Expertise
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-1.8rem text-slate-400 max-w-4xl mx-auto leading-relaxed"
          >
            From the legendary gem mines of Ratnapura to the world stage, we are
            Sri Lanka&apos;s premier institute for gemstones, jewelry, and
            gemological education. Our legacy is built on authenticity,
            excellence, and the timeless beauty of Earth&apos;s treasures.
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-0.5 h-16 bg-gradient-to-b from-amber-400 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section */}

      {/* Our Story Section */}

      {/* Values Section */}

      {/* Team Section */}

      {/* Certifications */}
      
      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-[80em] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-3xl blur-2xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
            <div className="relative bg-gradient-to-r from-amber-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-16 border border-white/20 text-center">
              <h2 className="text-5.6rem font-bold text-white mb-6">
                Begin Your Gemstone Journey
              </h2>
              <p className="text-2rem text-slate-300 mb-10 max-w-3xl mx-auto">
                Whether you are looking to invest in precious gems, design
                custom jewelry, or pursue a career in gemology, we are here to
                guide you.
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <motion.button
                  className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-2xl font-bold text-1.8rem flex items-center gap-3 hover:from-amber-400 hover:to-orange-500 transition-all duration-300"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 50px rgba(251, 191, 36, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/gems'}
                >
                  Explore Collections
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-bold text-1.8rem hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open('https://wa.me/94702857868', '_blank')}
                >
                  Contact Us
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutPage;
