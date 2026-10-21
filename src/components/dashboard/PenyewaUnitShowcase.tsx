"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Box, ArrowLeft, ChevronRight, Check, Building, Layers } from "lucide-react";
import { ModelViewer3D } from "@/components/landing/ModelViewer3D";

export interface PhotoItem {
  id: number;
  label: string;
  src: string;
  description: string;
}

export interface UnitDisplayConfig {
  tipeKey: "standar" | "ac" | "studio";
  namaTipe: string;
  lantaiText: string;
  dimensi: string;
  model3dSrc: string;
  badge: string;
  fasilitas: string[];
  fotos: PhotoItem[];
}

export const UNIT_CONFIGS: Record<"standar" | "ac" | "studio", UnitDisplayConfig> = {
  standar: {
    tipeKey: "standar",
    namaTipe: "Tipe Standar",
    lantaiText: "Lantai 1 • Blok A",
    dimensi: "3.5 × 4.0 m (14 m²)",
    model3dSrc: "/models/kamar_unit1.glb",
    badge: "Kamar Nyaman & Efisien",
    fasilitas: [
      "Kasur Single Comfort 100x200 empuk",
      "Kamar Mandi Dalam (Shower & Kloset Duduk)",
      "Meja & Kursi Belajar Ergonomis",
      "Lemari Pakaian 2 Pintu Minimalis",
      "WiFi High-Speed 100 Mbps",
      "Ventilasi Sirkulasi Udara Alami",
    ],
    fotos: [
      {
        id: 1,
        label: "Pintu Masuk",
        src: "/units/tipe-a/pov-1.jpg",
        description: "Akses pintu masuk kokoh dengan tata letak lorong kamar rapi.",
      },
      {
        id: 2,
        label: "Meja Belajar",
        src: "/units/tipe-a/pov-2.jpg",
        description: "Sudut belajar dan kerja fokus dilengkapi meja kayu solid, kursi nyaman, dan pencahayaan optimal.",
      },
      {
        id: 3,
        label: "Lemari Pakaian",
        src: "/units/tipe-a/pov-3.jpg",
        description: "Lemari pakaian 2 pintu dengan kapasitas gantung dan lipat luas.",
      },
      {
        id: 4,
        label: "Kamar Mandi",
        src: "/units/tipe-a/pov-4.jpg",
        description: "Kamar mandi dalam bersih dilengkapi shower, kloset duduk, ember, dan exhaust fan ventilasi.",
      },
      {
        id: 5,
        label: "Sudut Ruangan",
        src: "/units/tipe-a/pov-5.jpg",
        description: "Tampilan menyeluruh tempat tidur single dan sudut kamar 14 m² yang bersih dan tertata.",
      },
    ],
  },
  ac: {
    tipeKey: "ac",
    namaTipe: "Tipe AC",
    lantaiText: "Lantai 2 • Blok B",
    dimensi: "4.0 × 4.5 m (18 m²)",
    model3dSrc: "/models/kamar_unit2.glb",
    badge: "Kenyamanan Pendingin Ruangan Daikin",
    fasilitas: [
      "AC Split 1/2 PK Daikin Inverter Dingin Senyap",
      "Tempat Tidur Queen Single 120x200 Headboard Lembut",
      "Meja Kerja & Belajar Luas + Floating Shelves",
      "Jendela Kaca Lebar dengan Tirai Blackout",
      "Kamar Mandi Dalam + Water Heater",
      "Akses Koridor Tenang Lantai 2",
    ],
    fotos: [
      {
        id: 1,
        label: "Pintu Masuk & AC",
        src: "/units/tipe-b/pov-1.jpg",
        description: "Pintu masuk menghadap unit pendingin udara Daikin dan koridor bersih.",
      },
      {
        id: 2,
        label: "Tempat Tidur Queen",
        src: "/units/tipe-b/pov-2.jpg",
        description: "Tempat tidur Queen Single dengan sandaran empuk dan lampu temaram.",
      },
      {
        id: 3,
        label: "Meja Kerja & Belajar",
        src: "/units/tipe-b/pov-3.jpg",
        description: "Meja kerja solid dan rak dinding gantung untuk laptop dan buku.",
      },
      {
        id: 4,
        label: "Lemari & Jendela",
        src: "/units/tipe-b/pov-4.jpg",
        description: "Jendela kaca besar mengalirkan angin sejuk dengan lemari pakaian rapi.",
      },
      {
        id: 5,
        label: "Sudut Ruangan",
        src: "/units/tipe-b/pov-5.jpg",
        description: "Sudut pandang luas 18 m² memisahkan area istirahat dan produktivitas.",
      },
    ],
  },
  studio: {
    tipeKey: "studio",
    namaTipe: "Tipe Studio",
    lantaiText: "Lantai 3 • Blok C",
    dimensi: "6.0 × 5.0 m (30 m²)",
    model3dSrc: "/models/kamar_unit3.glb",
    badge: "Lantai 3 • Blok C",
    fasilitas: [
      "Living Room Lengkap Sofa Empuk & Coffee Table",
      "Dedicated Workstation Kursi Putar Ergonomis",
      "Tempat Tidur King Size 180x200 Mewah",
      "Smart TV 43 Inch Siap Layanan Streaming",
      "Kamar Mandi Mewah + Water Heater Ariston",
      "Balkon Pribadi Asri View Gunung Merapi",
    ],
    fotos: [
      {
        id: 1,
        label: "Foyer Pintu Masuk",
        src: "/units/tipe-c/pov-1.jpg",
        description: "Foyer depan menyambut dengan nuansa drop ceiling dan lantai kayu hangat.",
      },
      {
        id: 2,
        label: "Living Room & Sofa",
        src: "/units/tipe-c/pov-2.jpg",
        description: "Sofa empuk dua dudukan dengan coffee table kayu jati dan karpet lembut.",
      },
      {
        id: 3,
        label: "Tempat Tidur King Size",
        src: "/units/tipe-c/pov-3.jpg",
        description: "Ranjang King mewah berbalut dinding panel kayu dan aksen lampu gantung.",
      },
      {
        id: 4,
        label: "Pojok Kerja & Belajar",
        src: "/units/tipe-c/pov-4.jpg",
        description: "Workstation eksekutif dengan kursi ergonomis dan konektivitas daya lengkap.",
      },
      {
        id: 5,
        label: "Sudut Ruangan",
        src: "/units/tipe-c/pov-5.jpg",
        description: "Panorama luas 30 m² yang memperlihatkan kemewahan studio apartemen.",
      },
    ],
  },
};

export function resolveUnitType(unitKode: string, unitTipe?: string): "standar" | "ac" | "studio" {
  const cleanCode = (unitKode || "").trim().toUpperCase();
  const cleanTipe = (unitTipe || "").trim().toLowerCase();

  if (cleanCode.startsWith("C") || cleanTipe.includes("studio")) {
    return "studio";
  }
  if (cleanCode.startsWith("B") || cleanTipe.includes("ac")) {
    return "ac";
  }
  return "standar";
}

export interface UnitOption {
  id: string;
  kode: string;
  tipe: string;
  nomorKontrak: string;
  status: string;
  hargaPerBulan: number;
}

export interface PenyewaUnitShowcaseProps {
  units: UnitOption[];
  selectedUnitId?: string;
}

export function PenyewaUnitShowcase({ units, selectedUnitId }: PenyewaUnitShowcaseProps) {
  const [activeUnitId, setActiveUnitId] = useState<string>(
    selectedUnitId || (units[0]?.id ?? "")
  );
  // Dua tab utama yang diwajibkan: "Foto" dan "3D"
  const [activeTab, setActiveTab] = useState<"foto" | "3d">("foto");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  if (!units || units.length === 0) {
    return null;
  }

  const currentUnit = units.find((u) => u.id === activeUnitId) || units[0];
  const typeKey = resolveUnitType(currentUnit.kode, currentUnit.tipe);
  const config = UNIT_CONFIGS[typeKey];
  const activePhoto = config.fotos[activePhotoIndex] || config.fotos[0];

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? config.fotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === config.fotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="rounded-[28px] bg-white border border-[#E8EAEC] p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header Bagian: Unit Sewa Saya & Tab Toggle 'Foto' / '3D' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F2F4]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#76A733] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-[#5E8826] uppercase">
              Unit Sewa Anda
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#26292E] flex items-center gap-2">
            <span>Unit {currentUnit.kode}</span>
            <span className="text-sm font-normal text-[#737A84]">
              · {config.namaTipe} ({config.lantaiText.split("•")[0].trim()})
            </span>
          </h2>
          <p className="text-xs text-[#737A84]">
            Dimensi {config.dimensi} • {config.badge}
          </p>
        </div>

        {/* Action Controls: Unit Switcher (jika sewa > 1 unit) & Tab Toggle (Foto / 3D) */}
        <div className="flex flex-wrap items-center gap-3">
          {units.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-[#F4F5F7] rounded-xl border border-[#E8EAEC]">
              {units.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setActiveUnitId(u.id);
                    setActivePhotoIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeUnitId === u.id
                      ? "bg-white text-[#26292E] shadow-2xs"
                      : "text-[#737A84] hover:text-[#26292E]"
                  }`}
                >
                  Unit {u.kode}
                </button>
              ))}
            </div>
          )}

          {/* DUA TOMBOL FITUR UTAMA: "Foto" DAN "3D" (Sesuai Permintaan Langsung) */}
          <div className="flex items-center p-1 bg-[#F4F5F7] rounded-2xl border border-[#E8EAEC] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("foto")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "foto"
                  ? "bg-[#424242] text-white shadow-xs"
                  : "text-[#737A84] hover:text-[#26292E]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("3d")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "3d"
                  ? "bg-[#76A733] text-white shadow-xs"
                  : "text-[#737A84] hover:text-[#26292E]"
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Konten Utama: Tampilan Foto atau Model 3D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Visual (8 Kolom) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {activeTab === "foto" ? (
            /* TAB FOTO: Tampilan Foto Ruangan Asli */
            <div className="space-y-3">
              {/* Foto Utama Spotlight */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-[#1E2024] border border-[#E8EAEC] shadow-md min-h-[340px] sm:min-h-[400px] group">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Overlay Gradasi */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                {/* Badge Label Foto */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                    <span>Foto {activePhotoIndex + 1} dari 5: {activePhoto.label}</span>
                  </span>
                </div>

                {/* Tombol Geser Foto Kiri & Kanan */}
                <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 shadow-md active:scale-95"
                    title="Foto Sebelumnya"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 shadow-md active:scale-95"
                    title="Foto Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Keterangan Sudut Foto di Bagian Bawah */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h4 className="text-sm sm:text-base font-bold drop-shadow-md">
                    {activePhoto.label}
                  </h4>
                  <p className="text-xs text-white/85 drop-shadow-sm font-normal mt-0.5 max-w-lg">
                    {activePhoto.description}
                  </p>
                </div>
              </div>

              {/* 5 Thumbnail Foto Selector */}
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                {config.fotos.map((foto, idx) => {
                  const isFotoSelected = activePhotoIndex === idx;
                  return (
                    <button
                      key={foto.id}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`group relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all ${
                        isFotoSelected
                          ? "border-[#76A733] ring-2 ring-[#76A733]/40 scale-102 shadow-sm"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={foto.src}
                        alt={foto.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 py-1 px-1 text-center">
                        <span className="text-[10px] font-semibold text-white block truncate">
                          {foto.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 3D: Penampil 3D Interaktif dengan background-color #f8f9fa & Putar 360 Derajat */
            <div className="w-full">
              <ModelViewer3D
                src={config.model3dSrc}
                alt={`Model 3D ${config.namaTipe}`}
                title={`Unit ${currentUnit.kode} — Model 3D`}
                subtitle="Kontrol rotasi 360° aktif • Putar 3 dimensi"
                className="w-full min-h-[380px] sm:min-h-[440px]"
              />
            </div>
          )}
        </div>

        {/* Panel Spesifikasi & Fasilitas Kamar (4 Kolom) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Ringkasan Unit Sewa */}
          <div className="rounded-2xl p-4 sm:p-5 bg-[#F8F9FA] border border-[#E8EAEC] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8EAEC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737A84]">
                Spesifikasi Kamar
              </span>
              <span className="text-xs font-bold text-[#5E8826] bg-[#F2F7EC] px-2.5 py-0.5 rounded-full border border-[#76A733]/20">
                {currentUnit.status === "aktif" ? "Kontrak Aktif" : "Status Draf"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#737A84]">
                <span>Tipe Unit:</span>
                <strong className="text-[#26292E] font-bold">{config.namaTipe}</strong>
              </div>
              <div className="flex justify-between text-[#737A84]">
                <span>Lokasi Lantai:</span>
                <strong className="text-[#26292E] font-bold">{config.lantaiText}</strong>
              </div>
              <div className="flex justify-between text-[#737A84]">
                <span>Dimensi Ruang:</span>
                <strong className="text-[#26292E] font-bold">{config.dimensi}</strong>
              </div>
              <div className="flex justify-between text-[#737A84]">
                <span>Nomor Kontrak:</span>
                <span className="font-mono text-[#26292E] font-bold">{currentUnit.nomorKontrak}</span>
              </div>
            </div>
          </div>

          {/* Fasilitas Kamar Terpasang */}
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8EAEC] space-y-3">
            <h4 className="text-xs font-bold text-[#26292E] uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#76A733]" />
              <span>Fasilitas Baku Unit Anda:</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#424242]">
              {config.fasilitas.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76A733] mt-1.5 shrink-0" />
                  <span className="font-medium text-[#26292E]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
