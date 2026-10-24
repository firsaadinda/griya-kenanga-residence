"use client";

import { Star, Quote } from "lucide-react";

export interface TenantReview {
  id: number;
  name: string;
  role: string;
  unit: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export const TENANT_REVIEWS: TenantReview[] = [
  {
    id: 1,
    name: "Bayu Pratama",
    role: "Software Engineer",
    unit: "Tipe AC",
    avatar: "/profiles/bayu_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 8 Bulan",
    comment:
      "Kamar Tipe AC sangat tenang dan kondusif untuk WFH. Sirkulasi udara bagus, meja kerja ergonomis, dan sistem pelaporan kerusakan lewat portal web langsung ditangani pengelola dalam hitungan jam.",
  },
  {
    id: 2,
    name: "dr. Ratna Dewi",
    role: "Dokter Residen RSUP",
    unit: "Tipe Studio",
    avatar: "/profiles/ratna_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 1 Tahun",
    comment:
      "Tipe Studio di Lantai 3 sangat mewah dan lega. Setelah shift malam yang melelahkan di rumah sakit, suasana tenang dan pencahayaan hangat di kamar ini memberikan kenyamanan istirahat maksimal.",
  },
  {
    id: 3,
    name: "Sinta Maharani, S.Ars",
    role: "Arsitek & Desainer Interior",
    unit: "Tipe Studio",
    avatar: "/profiles/sinta_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 6 Bulan",
    comment:
      "Sebagai arsitek, saya kagum dengan tata ruang dan pemilihan materialnya. Balkon pribadinya asri, foyer rapi, serta pembagian zona tidur dan ruang tamu sangat presisi. Salah satu hunian sewa terbaik di Sleman.",
  },
  {
    id: 4,
    name: "Dimas Wicaksono",
    role: "Mahasiswa UGM",
    unit: "Tipe Standar",
    avatar: "/profiles/m_1_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 10 Bulan",
    comment:
      "Tipe Standar di Lantai 1 sangat pas untuk mahasiswa. Kamar mandi dalam bersih, ventilasi nyaman, lemari pakaian lega, dan tidak ada drama tagihan dobel karena invoice terbit otomatis tiap awal bulan.",
  },
  {
    id: 5,
    name: "Anisa Rahmawati",
    role: "Content Creator & Copywriter",
    unit: "Tipe AC",
    avatar: "/profiles/w_5_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 7 Bulan",
    comment:
      "Suasana di Griya Kenanga sangat damai dan estetik, cocok untuk fokus membuat konten dan riset kerjaan. Jendelanya besar bikin cahaya alami melimpah, lingkungannya aman, dan pengelolanya selalu sigap.",
  },
  {
    id: 6,
    name: "Nadya Putri",
    role: "Product Specialist Tech",
    unit: "Tipe AC",
    avatar: "/profiles/w_1_white.jpg",
    rating: 5,
    date: "Penyewa Aktif • 5 Bulan",
    comment:
      "Pelayanan pengelola di Griya Kenanga sangat profesional. Dari proses verifikasi identitas, aktivasi kontrak, sampai cek status tagihan bulanan semua terdata rapi di aplikasi. Privasi penghuni benar-benar terjaga.",
  },
];

export function TenantReviewsSection() {
  return (
    <section id="ulasan" className="w-full bg-[#F4F5F7] py-14 sm:py-20 px-6 sm:px-10 lg:px-14 border-t border-[#E3E6EB]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3E6EB] pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#5E8826] tracking-widest uppercase block">
              Pengalaman Penghuni • 6 Ulasan Terverifikasi
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2024] tracking-tight">
              Kenyamanan nyata dari penghuni Griya Kenanga.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#70757D]">
            <div className="flex items-center gap-1 text-[#BDA58B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#BDA58B] text-[#BDA58B]" />
              ))}
            </div>
            <span className="font-semibold text-[#1E2024]">4.9 / 5.0</span>
            <span>(Skor Kepuasan Penghuni)</span>
          </div>
        </div>

        {/* 6 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TENANT_REVIEWS.map((review) => {
            return (
              <div
                key={review.id}
                className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-lg bg-white border border-[#E3E6EB] hover:border-[#BDA58B]/50"
              >
                <div className="space-y-4">
                  {/* Rating + Quote Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#BDA58B]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#BDA58B] text-[#BDA58B]" />
                      ))}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F2F7EC] text-[#76A733] flex items-center justify-center">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-[#424242] leading-relaxed font-normal">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Profile Card Footer */}
                <div className="pt-6 mt-6 border-t border-[#F0F2F4] flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4C4B1] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E2024] truncate">
                      {review.name}
                    </h4>
                    <p className="text-[11px] text-[#70757D] truncate font-medium">
                      {review.role}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-semibold text-[#5E8826]">
                        {review.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
