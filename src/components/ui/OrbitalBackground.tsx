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
      <svg
        className="absolute left-1/2 top-0 h-full w-[1600px] -translate-x-1/2 stroke-[#CBD2DA] dark:stroke-slate-700 opacity-60"
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
          opacity="0.75"
        />
        <ellipse
          cx="800"
          cy="450"
          rx="420"
          ry="280"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.5"
        />

        {/* Busur lengkung diagonal dekoratif */}
        <path
          d="M -100,200 Q 400,-100 900,400 T 1700,500"
          strokeWidth="1"
          strokeDasharray="6 8"
          opacity="0.4"
        />
        <path
          d="M -50,900 Q 600,600 1200,1100 T 1750,900"
          strokeWidth="1"
          strokeDasharray="5 8"
          opacity="0.45"
        />
      </svg>
    </div>
  );
}
