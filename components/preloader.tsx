'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Luxury Serif Font (Bodoni Moda) & Secondary Serif (Cinzel)
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Dynamic progress calculation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev < 50) return prev + 2;
        if (prev < 85) return prev + 3;
        return prev + 1;
      });
    }, 30);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  const brandName = "DUGARS";
  const tagline = "THE ART OF TIMELESS JEWELLERY";

  // Reduced floating diamonds size for mobile/tablet optimization
  const floatingDiamonds = [
    { left: "12%", top: "40%", size: 24, mdSize: 42, delay: 0.1, rotate: 18, blur: "0.6px" },
    { left: "84%", top: "65%", size: 30, mdSize: 52, delay: 0.5, rotate: -22, blur: "0.4px" },
    { left: "15%", top: "80%", size: 34, mdSize: 60, delay: 0.8, rotate: 35, blur: "1.5px" },
    { left: "78%", top: "22%", size: 18, mdSize: 28, delay: 0.3, rotate: -12, blur: "0.8px" },
    { left: "24%", top: "30%", size: 20, mdSize: 30, delay: 1.0, rotate: 25, blur: "0.5px" },
    { left: "88%", top: "48%", size: 22, mdSize: 36, delay: 0.6, rotate: -18, blur: "1px" },
  ];

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#0A192F] select-none"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: "blur(16px)",
          }}
          transition={{
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* =========================================================
              FLOATING 3D DIAMOND CRYSTALS (RESPONSIVE SIZES)
          ========================================================== */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {floatingDiamonds.map((diamond, idx) => (
              <motion.div
                key={idx}
                className="absolute w-[var(--mobile-size)] md:w-[var(--desktop-size)] h-[var(--mobile-size)] md:h-[var(--desktop-size)]"
                style={
                  {
                    left: diamond.left,
                    top: diamond.top,
                    "--mobile-size": `${diamond.size}px`,
                    "--desktop-size": `${diamond.mdSize}px`,
                    filter: `blur(${diamond.blur}) drop-shadow(0 0 12px rgba(254,243,199,0.4))`,
                  } as React.CSSProperties
                }
                initial={{ opacity: 0, scale: 0.3, y: 30 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.9, 1.1, 0.9],
                  y: [-16, 16, -16],
                  rotate: [diamond.rotate - 10, diamond.rotate + 10, diamond.rotate - 10],
                }}
                transition={{
                  duration: 5 + idx * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: diamond.delay,
                }}
              >
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <polygon
                    points="50,5 90,30 50,95 10,30"
                    fill="url(#diamondFacetBg)"
                    stroke="url(#diamondEdge)"
                    strokeWidth="1.2"
                  />
                  <polygon points="50,5 90,30 50,38 10,30" fill="rgba(255, 255, 255, 0.45)" />
                  <polygon points="50,38 90,30 50,95" fill="rgba(243, 213, 143, 0.3)" />
                  <polygon points="50,38 10,30 50,95" fill="rgba(255, 255, 255, 0.2)" />
                  <defs>
                    <linearGradient id="diamondFacetBg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#F3D58F" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#7A561C" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="diamondEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFBEB" />
                      <stop offset="100%" stopColor="#C59B47" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ))}
          </div>

          {/* =========================================================
              DOUBLE-LINE ROYAL GOLD CORNERS
          ========================================================== */}
          {/* Top-Left Corner */}
          <div className="absolute top-5 left-5 w-16 h-16 pointer-events-none md:top-8 md:left-8 md:w-24 md:h-24">
            <div className="absolute inset-0 border-l-2 border-t-2 border-[#D6B56D]/50" />
            <div className="absolute inset-2 border-l border-t border-[#D6B56D]/30" />
          </div>

          {/* Top-Right Corner */}
          <div className="absolute top-5 right-5 w-16 h-16 pointer-events-none md:top-8 md:right-8 md:w-24 md:h-24">
            <div className="absolute inset-0 border-r-2 border-t-2 border-[#D6B56D]/50" />
            <div className="absolute inset-2 border-r border-t border-[#D6B56D]/30" />
          </div>

          {/* Bottom-Left Corner */}
          <div className="absolute bottom-5 left-5 w-16 h-16 pointer-events-none md:bottom-8 md:left-8 md:w-24 md:h-24">
            <div className="absolute inset-0 border-l-2 border-b-2 border-[#D6B56D]/50" />
            <div className="absolute inset-2 border-l border-b border-[#D6B56D]/30" />
          </div>

          {/* Bottom-Right Corner */}
          <div className="absolute bottom-5 right-5 w-16 h-16 pointer-events-none md:bottom-8 md:right-8 md:w-24 md:h-24">
            <div className="absolute inset-0 border-r-2 border-b-2 border-[#D6B56D]/50" />
            <div className="absolute inset-2 border-r border-b border-[#D6B56D]/30" />
          </div>

          {/* =========================================================
              MAIN CENTERPIECE EMBLEM & TYPOGRAPHY
          ========================================================== */}
          <div className="relative z-20 flex flex-col items-center justify-center my-auto pt-8">
            {/* Custom Brand Logo Image with Pulsing Aura */}
            <motion.div
              className="relative flex items-center justify-center w-36 h-36 md:w-52 md:h-52"
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Backlight Aura */}
              <div className="absolute inset-0 rounded-full bg-[#F3D58F]/10 blur-2xl animate-pulse" />
              
              <img
                src="/logo.png"
                alt="Dugars Logo"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_6px_30px_rgba(243,213,143,0.8)]"
              />
            </motion.div>

            {/* BRAND NAME - DUGARS */}
           
<div className="mt-8 flex overflow-hidden">
  {brandName.split("").map((char, index) => (
    <motion.span
      key={index}
      initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{
        delay: 0.35 + index * 0.07,
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      
className="text-2xl md:text-6xl font-bold tracking-[0.1em] md:tracking-[0.2em] bg-gradient-to-b from-[#FFFDF4] via-[#F3D58F] to-[#9A732C] bg-clip-text text-transparent px-1"

      style={{
        fontFamily: "'Bodoni Moda', serif",
        filter: "drop-shadow(0 4px 20px rgba(243,213,143,0.4))",
      }}
    >
      {char}
    </motion.span>
  ))}
</div>


            {/* TAGLINE */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 1.1 }}
              className="mt-3 text-[9px] md:text-[12px] font-semibold tracking-[0.4em] md:tracking-[0.6em] text-[#F3D58F]/90 text-center uppercase"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {tagline}
            </motion.p>

            {/* ORNAMENTAL LUXURY DIVIDER */}
            <div className="mt-5 flex items-center gap-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 70 }}
                transition={{ delay: 0.95, duration: 0.9 }}
                className="h-[1px] bg-gradient-to-r from-transparent via-[#F3D58F]/70 to-[#F3D58F]"
              />
              <div className="w-1.5 h-1.5 bg-[#F3D58F] rotate-45 shadow-[0_0_8px_#F3D58F]" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 70 }}
                transition={{ delay: 0.95, duration: 0.9 }}
                className="h-[1px] bg-gradient-to-l from-transparent via-[#F3D58F]/70 to-[#F3D58F]"
              />
            </div>
          </div>

          {/* =========================================================
              BOTTOM PROGRESS BAR & STATUS COUNTER
          ========================================================== */}
          <div className="relative z-20 mb-24 md:mb-28 flex flex-col items-center">
            {/* Glowing Golden Progress Track */}
            <div className="relative h-[3.5px] w-[260px] md:w-[380px] overflow-hidden rounded-full bg-[#031427] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
              {/* Inner Progress Fill */}
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7A561C] via-[#FFFBEB] to-[#F3D58F] shadow-[0_0_20px_#F3D58F]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              >
                {/* Leading Edge Diamond Sparkle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 md:w-2.5 md:h-2.5 rotate-45 bg-white shadow-[0_0_15px_#FFFFFF]" />
              </motion.div>
            </div>

            {/* Status & Progress Percentage */}
            <div className="mt-4 flex w-[260px] md:w-[380px] items-center justify-between text-[10px] md:text-[11px] font-medium tracking-[0.3em] uppercase">
              <span className="text-[#F3D58F]/75 font-medium" style={{ fontFamily: "'Cinzel', serif" }}>
                {progress === 100 ? "ATELIER READY" : "CRAFTING LUXURY"}
              </span>
              <span className="font-mono text-[#FFFBEB] font-bold tracking-widest">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}