"use client";

import React, { useState } from "react";
import {
  Box,
  Image as ImageIcon,
  Check,
  Building,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  LogIn,
  UserPlus,
  KeyRound,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { ModelViewer3D } from "@/components/landing/ModelViewer3D";

export interface PhotoDetailItem {
  id: number;
  label: string;
  src: string;
  description: string;
}

export interface UnitTypeData {
  id: "standar" | "ac" | "studio";
  name: string;
  floorTitle: string;
  floorNumber: number;
  priceFormatted: string;
  dimensionText: string;
  modelGlbSrc: string;
  badge: string;
  highlightDescription: string;
  features: string[];
  fotos: PhotoDetailItem[];
}

export const UNIT_TYPES_DATA: UnitTypeData[] = [
  {
    id: "standar",
    name: "Tipe Standar",
    floorTitle: "Lantai 1 • Blok A",
    floorNumber: 1,
    priceFormatted: "Rp 1.450.000",
    dimensionText: "3.5 × 4.0 m (14 m²)",
    modelGlbSrc: "/models/kamar_unit1.glb",
    badge: "Lantai 1 • Blok A",
    highlightDescription:
      "Dirancang efisien dan tenang untuk mahasiswa dan profesional muda. Dilengkapi ventilasi sirkulasi udara alami yang segar, kamar mandi dalam bersih, lemari pakaian, serta meja belajar terpisah.",
    features: [
      "Kasur Single Comfort 100x200 empuk",
      "Kamar Mandi Dalam (Shower & Kloset Duduk)",
      "Meja & Kursi Belajar Ergonomis",
      "Lemari Pakaian 2 Pintu Minimalis",
      "WiFi Fiber Optic 100 Mbps",
      "Ventilasi & Sirkulasi Alami Sehat",
    ],
    fotos: [
      {
        id: 1,
        label: "Pintu Masuk",
        src: "/units/tipe-a/pov-1.jpg",
        description: "Akses pintu masuk kokoh dengan tata letak lorong kamar yang rapi dan lapang.",
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
        description: "Lemari pakaian proporsional dua pintu dengan kapasitas gantung dan lipat luas.",
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
        description: "Tampilan menyeluruh tempat tidur single dan sudut ruangan 14 m² yang bersih, terang, dan tertata rapi.",
      },
    ],
  },
  {
    id: "ac",
    name: "Tipe AC",
    floorTitle: "Lantai 2 • Blok B",
    floorNumber: 2,
    priceFormatted: "Rp 1.850.000",
    dimensionText: "4.0 × 4.5 m (18 m²)",
    modelGlbSrc: "/models/kamar_unit2.glb",
    badge: "Lantai 2 • Blok B",
    highlightDescription:
      "Kenyamanan ekstra dengan pendingin ruangan inverter hemat energi, kasur Queen Single nyaman, meja kerja luas dengan rak gantung kayu, dan jendela kaca lebar menghadap pemandangan luar.",
    features: [
      "AC Split 1/2 PK Daikin Inverter Dingin Senyap",
      "Tempat Tidur Queen Single 120x200 Headboard Lembut",
      "Meja Kerja & Belajar Luas + Floating Shelves",
      "Jendela Kaca Lebar dengan Tirai Blackout",
      "Kamar Mandi Dalam + Water Heater Hangat",
      "Akses Koridor Tenang & Asri Lantai 2",
    ],
    fotos: [
      {
        id: 1,
        label: "Pintu Masuk & AC",
        src: "/units/tipe-b/pov-1.jpg",
        description: "Pintu masuk menghadap pendingin udara Daikin dan koridor berlantai bersih.",
      },
      {
        id: 2,
        label: "Tempat Tidur Queen",
        src: "/units/tipe-b/pov-2.jpg",
        description: "Tempat tidur Queen Single dengan sandaran empuk dan lampu temaram hangat.",
      },
      {
        id: 3,
        label: "Meja Kerja & Belajar",
        src: "/units/tipe-b/pov-3.jpg",
        description: "Meja kerja solid dan rak dinding fungsional cocok untuk laptop dan koleksi buku.",
      },
      {
        id: 4,
        label: "Lemari & Jendela",
        src: "/units/tipe-b/pov-4.jpg",
        description: "Jendela kaca besar mengalirkan angin sejuk dengan lemari pakaian terintegrasi rapi.",
      },
      {
        id: 5,
        label: "Sudut Ruangan",
        src: "/units/tipe-b/pov-5.jpg",
        description: "Sudut pandang luas 18 m² memperlihatkan zona istirahat dan produktivitas terpisah.",
      },
    ],
  },
  {
    id: "studio",
    name: "Tipe Studio",
    floorTitle: "Lantai 3 • Blok C",
    floorNumber: 3,
    priceFormatted: "Rp 2.750.000",
    dimensionText: "6.0 × 5.0 m (30 m²)",
    modelGlbSrc: "/models/kamar_unit3.glb",
    badge: "Lantai 3 • Blok C",
    highlightDescription:
      "Tipe paling mewah dan lega dengan konsep studio terpadu. Memiliki ruang tamu sofa empuk, workstation profesional siap monitor ganda, ranjang King size, dan balkon pribadi pemandangan asri.",
    features: [
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
        description: "Foyer depan menyambut dengan nuansa drop-ceiling elegan dan lantai kayu hangat.",
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
        description: "Ranjang King mewah berbalut dinding panel kayu dan aksen lampu gantung temaram.",
      },
      {
        id: 4,
        label: "Pojok Kerja & Belajar",
        src: "/units/tipe-c/pov-4.jpg",
        description: "Workstation eksekutif dengan kursi putar ergonomis dan konektivitas daya lengkap.",
      },
      {
        id: 5,
        label: "Sudut Ruangan",
        src: "/units/tipe-c/pov-5.jpg",
        description: "Panorama luas 30 m² yang menunjukkan kemegahan tata ruang studio apartemen.",
      },
    ],
  },
];

export interface UnitDetailInteractiveShowcaseProps {
  id?: string;
  selectedTypeId?: "standar" | "ac" | "studio";
  onSelectTypeId?: (typeId: "standar" | "ac" | "studio") => void;
}

export function UnitDetailInteractiveShowcase({
  id = "units-section",
  selectedTypeId: controlledTypeId,
  onSelectTypeId,
}: UnitDetailInteractiveShowcaseProps) {
  const [internalTypeId, setInternalTypeId] = useState<"standar" | "ac" | "studio">("standar");
  const selectedTypeId = controlledTypeId !== undefined ? controlledTypeId : internalTypeId;

  // Tab switch: "foto" dan "3d"
  const [activeTab, setActiveTab] = useState<"foto" | "3d">("foto");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  React.useEffect(() => {
    const handleSelectEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ typeId: "standar" | "ac" | "studio" }>;
      if (customEvent.detail?.typeId) {
        setInternalTypeId(customEvent.detail.typeId);
        setActivePhotoIndex(0);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("griya-select-unit", handleSelectEvent);
      return () => window.removeEventListener("griya-select-unit", handleSelectEvent);
    }
  }, []);

  const activeType = UNIT_TYPES_DATA.find((t) => t.id === selectedTypeId) || UNIT_TYPES_DATA[0];
  const activePhoto = activeType.fotos[activePhotoIndex] || activeType.fotos[0];

  const handleSwitchType = (typeId: "standar" | "ac" | "studio") => {
    setInternalTypeId(typeId);
    if (onSelectTypeId) {
      onSelectTypeId(typeId);
    }
    setActivePhotoIndex(0);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? activeType.fotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === activeType.fotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="eksplorasi-ruang" className="w-full bg-white py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-t border-[#E3E6EB]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Title & Type Pills */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#F0F2F4] pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2024] tracking-tight">
              Eksplorasi Ruang &amp; Pilihan Kamar
            </h2>
            <p className="text-xs sm:text-sm text-[#70757D] max-w-2xl leading-relaxed">
              Pilih tipe kamar untuk melihat foto ruangan asli atau beralih ke model 3D interaktif yang dapat diputar 360 derajat.
            </p>
          </div>

          {/* Room Type Selector (Tipe Standar, Tipe AC, Tipe Studio) */}
          <div className="flex flex-wrap items-center gap-2 bg-[#F4F5F7] p-1.5 rounded-full border border-[#E3E6EB] self-start lg:self-auto">
            {UNIT_TYPES_DATA.map((t) => {
              const isSelected = selectedTypeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchType(t.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-[#5E8826] text-white shadow-sm scale-102"
                      : "text-[#70757D] hover:text-[#1E2024] hover:bg-white/60"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="hidden sm:inline text-[10px] font-normal opacity-80 ml-1.5">
                    ({t.floorTitle.split("•")[0].trim()})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage Box */}
        <div id="spesifikasi-3d" className="scroll-mt-10 rounded-[32px] bg-[#F8F9FA] border border-[#E3E6EB] p-5 sm:p-8 lg:p-10 shadow-sm space-y-8">
          {/* Header of Active Type */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E3E6EB]">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold tracking-wider text-[#5E8826] uppercase">
                  {activeType.floorTitle}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E2024]">
                {activeType.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#70757D] max-w-xl">
                {activeType.highlightDescription}
              </p>
            </div>

            {/* DUA TOMBOL FITUR UTAMA: "Foto" DAN "3D" */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 bg-white rounded-2xl border border-[#E3E6EB] shadow-xs">
                {/* Tab: Foto */}
                <button
                  type="button"
                  onClick={() => setActiveTab("foto")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "foto"
                      ? "bg-[#5E8826] text-white shadow-xs"
                      : "text-[#70757D] hover:text-[#1E2024] hover:bg-[#F4F5F7]"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Foto</span>
                </button>

                {/* Tab: 3D */}
                <button
                  type="button"
                  onClick={() => setActiveTab("3d")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "3d"
                      ? "bg-[#5E8826] text-white shadow-xs"
                      : "text-[#70757D] hover:text-[#1E2024] hover:bg-[#F4F5F7]"
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span>3D</span>
                </button>
              </div>

              {/* Price & Dimension Pill */}
              <div className="hidden xl:flex flex-col items-end px-4 py-1.5 bg-white rounded-2xl border border-[#E3E6EB]">
                <span className="text-[10px] text-[#70757D] uppercase font-bold">Tarif Sewa</span>
                <span className="text-base font-extrabold text-[#5E8826]">{activeType.priceFormatted}</span>
              </div>
            </div>
          </div>

          {/* Central Interactive Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Canvas (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              {activeTab === "foto" ? (
                /* TAB FOTO RUANGAN */
                <div className="space-y-4">
                  {/* Spotlight Image */}
                  <div className="relative w-full rounded-2xl overflow-hidden bg-[#1E2024] border border-[#E3E6EB] shadow-md min-h-[360px] sm:min-h-[440px] group">
                    <img
                      src={activePhoto.src}
                      alt={activePhoto.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Badge info */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold tracking-wide border border-white/20">
                        <span>Foto {activePhotoIndex + 1} dari 5: {activePhoto.label}</span>
                      </span>
                    </div>

                    {/* Prev & Next slider arrows */}
                    <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 shadow-md active:scale-95"
                        title="Foto Sebelumnya"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20 shadow-md active:scale-95"
                        title="Foto Berikutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Photo text info on bottom */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm sm:text-base font-bold drop-shadow-md">
                        {activePhoto.label}
                      </p>
                      <p className="text-xs text-white/85 drop-shadow-sm font-normal max-w-lg mt-0.5">
                        {activePhoto.description}
                      </p>
                    </div>
                  </div>

                  {/* 5 Thumbnails */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {activeType.fotos.map((foto, idx) => {
                      const isPhotoSelected = activePhotoIndex === idx;
                      return (
                        <button
                          key={foto.id}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`group relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all ${
                            isPhotoSelected
                              ? "border-[#76A733] ring-2 ring-[#76A733]/40 scale-102 shadow-md"
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
                /* TAB 3D DENGAN BACKGROUND-COLOR: #f8f9fa */
                <div className="w-full">
                  <ModelViewer3D
                    src={activeType.modelGlbSrc}
                    alt={`Model 3D ${activeType.name}`}
                    title={`${activeType.name} — Model 3D`}
                    subtitle="Kontrol rotasi 360° aktif • Putar 3 dimensi"
                    className="w-full min-h-[420px] sm:min-h-[480px]"
                  />
                </div>
              )}
            </div>

            {/* Right Side Panel: Spesifikasi Publik & Fasilitas Terpadu (Satu Card Utuh & Kokoh) */}
            <div className="lg:col-span-4 h-full flex flex-col">
              <div className="rounded-2xl p-6 sm:p-7 bg-white border border-[#E3E6EB] shadow-xs flex-1 flex flex-col justify-between space-y-6">
                {/* Bagian 1: Header & Spesifikasi Unit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0F2F4] pb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2024] flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-[#76A733]" />
                        <span>Spesifikasi {activeType.name}</span>
                      </h4>
                      <p className="text-[11px] text-[#70757D] mt-0.5">
                        {activeType.floorTitle} • Griya Kenanga
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-[#5E8826]">
                      {activeType.priceFormatted}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-[#424242]">
                    <div className="flex justify-between py-1.5 border-b border-[#F8F9FA]">
                      <span className="text-[#70757D]">Kapasitas Lantai:</span>
                      <strong className="text-[#1E2024]">8 Kamar Eksklusif</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F8F9FA]">
                      <span className="text-[#70757D]">Dimensi Ruang:</span>
                      <strong className="text-[#1E2024]">{activeType.dimensionText}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F8F9FA]">
                      <span className="text-[#70757D]">Kamar Mandi:</span>
                      <strong className="text-[#1E2024]">Dalam (Privat)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F8F9FA]">
                      <span className="text-[#70757D]">Akses Keamanan:</span>
                      <strong className="text-[#1E2024]">Kartu Akses &amp; CCTV 24 Jam</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#70757D]">Area Parkir:</span>
                      <strong className="text-[#1E2024]">Mobil &amp; Motor Beratap</strong>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Fasilitas Baku Kamar */}
                <div className="pt-4 border-t border-[#F0F2F4] space-y-3">
                  <h4 className="text-xs font-bold text-[#1E2024] uppercase tracking-wider">
                    FASILITAS BAKU {activeType.name.toUpperCase()}:
                  </h4>
                  <ul className="space-y-2 text-xs text-[#424242]">
                    {activeType.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#76A733] mt-1.5 shrink-0" />
                        <span className="font-medium text-[#1E2024]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Room Types Quick Selection Cards */}
        <div id="tipe-kamar" className="scroll-mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {UNIT_TYPES_DATA.map((t) => {
            const isSelected = selectedTypeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleSwitchType(t.id)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? "bg-[#4A6C2F] text-white border-[#4A6C2F] shadow-xl ring-2 ring-[#4A6C2F]/35 scale-[1.02]"
                    : "bg-white hover:bg-[#F8F9FA] text-[#1E2024] border-[#E3E6EB] shadow-xs"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? "text-white/90"
                          : "text-[#5E8826]"
                      }`}
                    >
                      {t.floorTitle.split("•")[0].trim()}
                    </span>
                    <span className={`text-xs font-medium ${isSelected ? "text-white/80" : "text-[#70757D]"}`}>
                      {t.dimensionText}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold">{t.name}</h4>
                    <p className={`text-xs mt-1 ${isSelected ? "text-white/85" : "text-[#70757D]"}`}>
                      {t.badge}
                    </p>
                  </div>

                  {/* Thumbnail preview */}
                  <div className="w-full h-32 rounded-xl overflow-hidden relative">
                    <img
                      src={t.fotos[0].src}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                      5 Foto + 3D
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] block ${isSelected ? "text-white/75" : "text-[#70757D]"}`}>
                      Tarif Sewa
                    </span>
                    <span className={`text-base font-extrabold ${isSelected ? "text-white" : "text-[#5E8826]"}`}>
                      {t.priceFormatted}
                      <span className="text-[10px] font-normal text-inherit">/bln</span>
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                      isSelected
                        ? "bg-white text-[#4A6C2F] font-bold shadow-xs"
                        : "bg-[#F4F5F7] text-[#1E2024] hover:bg-[#E3E6EB]"
                    }`}
                  >
                    <span>{isSelected ? "Sedang Dibuka" : "Buka Detail"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
