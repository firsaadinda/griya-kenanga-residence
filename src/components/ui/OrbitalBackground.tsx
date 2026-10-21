import React from "react";

/**
 * Komponen Latar Belakang Garis Lengkung Putus-Putus (Dashed Orbital SVG Lines ala Terra)
 * Menampilkan aksen garis lengkung astronomis/arsitektur elegan di background luar.
 */
export function OrbitalBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Ambient warm & olive glow matching Griya Kenanga Residence luxury tone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(94,136,38,0.07)_0%,rgba(212,196,177,0.06)_40%,transparent_75%)]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(94,136,38,0.035)_0%,transparent_70%)]" />
      <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(163,135,108,0.04)_0%,transparent_70%)]" />

      {/* Subtle architectural & orbital SVG curves */}
      <svg
        className="absolute left-1/2 top-0 h-full w-[1600px] -translate-x-1/2 stroke-[#5E8826] opacity-[0.14]"
        fill="none"
        viewBox="0 0 1600 1200"
      >
        {/* Lingkaran / kurva elips orbital bertingkat dengan dashed strokes */}
        <ellipse
          cx="800"
          cy="200"
          rx="720"
          ry="480"
          strokeWidth="1.2"
          strokeDasharray="6 8"
        />
        <ellipse
          cx="800"
          cy="320"
          rx="580"
          ry="380"
          strokeWidth="1"
          strokeDasharray="5 7"
          opacity="0.8"
        />
        <ellipse
          cx="800"
          cy="450"
          rx="420"
          ry="280"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.6"
        />

        {/* Busur lengkung diagonal dekoratif */}
        <path
          d="M -100,200 Q 400,-100 900,400 T 1700,500"
          strokeWidth="1"
          strokeDasharray="6 8"
          opacity="0.5"
        />
        <path
          d="M -50,900 Q 600,600 1200,1100 T 1750,900"
          strokeWidth="1"
          strokeDasharray="5 8"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
