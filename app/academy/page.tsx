"use client";
import React from "react";
import Footer from "@/components/FooterPage";
import Gallery3D from "@/components/Gallery3D";

const AcademyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <section className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-r from-purple-800/60 to-indigo-900/60">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
          Gemology Masterclass
        </h1>
        <p className="text-lg md:text-3xl text-amber-300 mb-4 text-center max-w-2xl">
          Unlock the secrets of gemstones with hands-on training
        </p>
        <div className="text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Course Overview</h2>
          <p><strong>Course Title:</strong> Geuda Heat Treatment Course</p>
          <p><strong>Target Audience:</strong> Designed for both beginners and professionals.</p>
          <p><strong>Institution:</strong> Royal Gem & Jewellery Hub</p>

          <h3 className="text-3xl font-semibold text-white mt-6 mb-2">What You Will Learn</h3>
          <ul className="text-2xl list-disc list-inside">
            <li>Geuda Heat Treatment Techniques</li>
            <li>Furnace Operation & Handling</li>
            <li>Valuation & Pricing Strategies</li>
            <li>Accurate Geuda Identification</li>
            <li>Identifying Defects</li>
          </ul>

          <h3 className="text-3xl font-semibold text-white mt-6 mb-2">Logistics & Enrollment</h3>
          <p><strong>Location:</strong> Bathgamgoda, Pelmadulla</p>
          <p><strong>Start Date:</strong> January 17, 2026 (Saturday)</p>
          <p><strong>Course Fee:</strong> Rs. 75,000/=</p>
          <p><strong>Availability:</strong> Limited seats available.</p>

          <h3 className="text-3xl font-semibold text-white mt-6 mb-2">Contact Information</h3>
          <p><strong>WhatsApp:</strong> 070 28 57 868</p>
          <p><strong>Phone:</strong> 071 81 79 587</p>
        </div>
      </section>

      

      <Gallery3D />

      <Footer />
    </div>
  );
};

export default AcademyPage;