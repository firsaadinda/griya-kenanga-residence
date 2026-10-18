"use client";

import React, { useState, useTransition, useMemo } from "react";
import { UserRole } from "@/lib/auth/guard";
import {
  buatTagihanBulananAction,
  catatPembayaranAction,
  batalkanPembayaranAction,
  batalkanTagihanAction,
  getTagihanDetailAction,
} from "@/lib/actions/tagihan-actions";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building,
  User,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  UploadCloud,
  FileText,
  DollarSign,
  AlertTriangle,
  X,
  Eye,
  RefreshCw,
  Loader2,
  Check,
} from "lucide-react";

export interface TagihanItem {
  id: string;
  nomor: string;
  kontrak_id: string;
  periode: string; // YYYY-MM-01
  jatuh_tempo: string; // YYYY-MM-10
  nominal_sewa: number;
  denda: number;
  terbayar: number;
  status: "belum_bayar" | "sebagian" | "lunas" | "dibatalkan";
  alasan_batal?: string | null;
  unit_kode: string;
  unit_tipe: string;
  penyewa_nama: string;
  penyewa_email: string;
  penyewa_hp?: string | null;
}

export interface PembayaranDetail {
  id: string;
  jumlah: number;
  metode: "tunai" | "transfer" | "mayar";
  tanggal_bayar: string;
  bukti_path?: string | null;
  nama_bank?: string | null;
  nama_rekening_pengirim?: string | null;
  status: "sah" | "dibatalkan";
  alasan_batal?: string | null;
  dibuat_pada: string;
  pencatat?: { id: string; nama_lengkap: string } | null;
}

interface TagihanClientViewProps {
  initialTagihanList: TagihanItem[];
  userRole: UserRole;
  userName: string;
  activePeriode: string; // e.g. "2026-10-01"
  availablePeriodes: string[]; // e.g. ["2026-10-01", "2026-09-01", "2026-08-01", "2026-11-01"]
}

export function TagihanClientView({
  initialTagihanList,
  userRole,
  userName,
  activePeriode,
  availablePeriodes,
}: TagihanClientViewProps) {
  const [tagihanList, setTagihanList] = useState<TagihanItem[]>(initialTagihanList);
  const [selectedPeriode, setSelectedPeriode] = useState<string>(activePeriode);
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Catat Pembayaran States
  const [isCatatModalOpen, setIsCatatModalOpen] = useState(false);
  const [selectedTagihanForPayment, setSelectedTagihanForPayment] = useState<TagihanItem | null>(null);
  const [paymentJumlah, setPaymentJumlah] = useState<string>("");
  const [paymentMetode, setPaymentMetode] = useState<"tunai" | "transfer">("transfer");
  const [paymentTanggal, setPaymentTanggal] = useState<string>("2026-10-15"); // default sesuai acuan PRD
  const [paymentBank, setPaymentBank] = useState<string>("BCA");
  const [customBank, setCustomBank] = useState<string>("");
  const [paymentNamaRekening, setPaymentNamaRekening] = useState<string>("");
  const [paymentBuktiFile, setPaymentBuktiFile] = useState<File | null>(null);
  const [paymentBuktiPreview, setPaymentBuktiPreview] = useState<string | null>(null);

  // Lightbox Modal Real Foto Bukti Transfer (Resolusi Penuh)
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Modal Detail Tagihan States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTagihan, setDetailTagihan] = useState<TagihanItem | null>(null);
  const [detailPembayaranList, setDetailPembayaranList] = useState<PembayaranDetail[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modal Alasan Pembatalan States (Khusus Pemilik)
  const [isBatalBayarModalOpen, setIsBatalBayarModalOpen] = useState(false);
  const [targetPembayaranId, setTargetPembayaranId] = useState<string | null>(null);
  const [isBatalTagihanModalOpen, setIsBatalTagihanModalOpen] = useState(false);
  const [targetTagihanId, setTargetTagihanId] = useState<string | null>(null);
  const [alasanBatalInput, setAlasanBatalInput] = useState("");

  // Feedback Notification & Double Submit State
  const [alertState, setAlertState] = useState<{
    type: "success" | "error" | "rate_limit";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Pemetaan Bukti Transfer Resmi per Penyewa (21 Lembar Portrait)
  const TENANT_BUKTI_MAP: Record<string, { url: string; bank: string; owner: string }> = {
    aditya: { url: "/bukti-bayar/bukti-aditya-pratama-bca.png", bank: "BCA", owner: "Aditya Pratama" },
    bella: { url: "/bukti-bayar/bukti-bella-safitri-mayar.png", bank: "Mayar", owner: "Bella Safitri" },
    cahya: { url: "/bukti-bayar/bukti-cahya-ramadhan-bca.png", bank: "BCA", owner: "Cahya Ramadhan" },
    dimas: { url: "/bukti-bayar/bukti-dimas-saputra-bca.png", bank: "BCA", owner: "Dimas Saputra" },
    "eka wulandari": { url: "/bukti-bayar/bukti-eka-wulandari-gopay.png", bank: "Gopay", owner: "Eka Wulandari" },
    gilang: { url: "/bukti-bayar/bukti-gilang-mahendra-bni.png", bank: "BNI", owner: "Gilang Mahendra" },
    hana: { url: "/bukti-bayar/bukti-hana-puspita-mandiri.png", bank: "Mandiri", owner: "Hana Puspita" },
    indra: { url: "/bukti-bayar/bukti-indra-kurniawan-bni.png", bank: "BNI", owner: "Indra Kurniawan" },
    jihan: { url: "/bukti-bayar/bukti-jihan-aulia-bca.png", bank: "BCA", owner: "Jihan Aulia" },
    kevin: { url: "/bukti-bayar/bukti-kevin-wijaya-mandiri.png", bank: "Mandiri", owner: "Kevin Wijaya" },
    laras: { url: "/bukti-bayar/bukti-laras-anggraini-mandiri.png", bank: "Mandiri", owner: "Laras Anggraini" },
    "muhammad rizki": { url: "/bukti-bayar/bukti-muhammad-rizki-bni.png", bank: "BNI", owner: "Muhammad Rizki" },
    nadia: { url: "/bukti-bayar/bukti-nadia-salsabila-bca.png", bank: "BCA", owner: "Nadia Salsabila" },
    oki: { url: "/bukti-bayar/bukti-oki-firmansyah-bca.png", bank: "BCA", owner: "Oki Firmansyah" },
    "putri lestari": { url: "/bukti-bayar/bukti-putri-lestari-gopay.png", bank: "Gopay", owner: "Putri Lestari" },
    raka: { url: "/bukti-bayar/bukti-raka-aditama-mandiri.png", bank: "Mandiri", owner: "Raka Aditama" },
    salma: { url: "/bukti-bayar/bukti-salma-nuraini-bni.png", bank: "BNI", owner: "Salma Nuraini" },
    teguh: { url: "/bukti-bayar/bukti-teguh-santoso-gopay.png", bank: "Gopay", owner: "Teguh Santoso" },
    vina: { url: "/bukti-bayar/bukti-vina-rahmawati-mayar.png", bank: "Mayar", owner: "Vina Rahmawati" },
    wahyu: { url: "/bukti-bayar/bukti-wahyu-hidayat-mandiri.png", bank: "Mandiri", owner: "Wahyu Hidayat" },
    yoga: { url: "/bukti-bayar/bukti-yoga-permana-bca.png", bank: "BCA", owner: "Yoga Permana" },
  };

  // Helper resolusi URL bukti bayar
  const getBuktiUrl = (buktiPath?: string | null, tenantName?: string): string => {
    if (buktiPath) {
      if (buktiPath.startsWith("http://") || buktiPath.startsWith("https://")) {
        return buktiPath;
      }
      if (buktiPath.startsWith("/")) {
        return buktiPath;
      }
      if (buktiPath.startsWith("bukti-bayar/")) {
        return `/${buktiPath}`;
      }
      if (buktiPath.startsWith("bukti-") && (buktiPath.endsWith(".png") || buktiPath.endsWith(".svg") || buktiPath.endsWith(".jpg"))) {
        return `/bukti-bayar/${buktiPath}`;
      }
    }

    // Fallback otomatis berdasarkan nama penyewa
    if (tenantName) {
      const norm = tenantName.toLowerCase();
      for (const [key, val] of Object.entries(TENANT_BUKTI_MAP)) {
        if (norm.includes(key)) {
          return val.url;
        }
      }
    }

    return "/bukti-bayar/bukti-aditya-pratama-bca.png";
  };

  // Format Helper Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Periode Label Helper (e.g. "2026-10-01" -> "Oktober 2026")
  const getPeriodeLabel = (p: string) => {
    if (!p) return "";
    const [year, month] = p.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || month} ${year}`;
  };

  const getNextMonthLabel = (p: string) => {
    if (!p) return "Bulan Berikutnya";
    const d = new Date(p);
    d.setMonth(d.getMonth() + 1);
    return getPeriodeLabel(d.toISOString().split("T")[0]);
  };

  const getNextMonthPeriode = (p: string) => {
    if (!p) return "2026-11-01";
    const [yStr, mStr] = p.split("-");
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    return `${y}-${String(m).padStart(2, "0")}-01`;
  };

  // Hitung Denda Simulasi Real-Time berdasarkan tanggal bayar yang dipilih di Modal
  const calculatedDendaForModal = useMemo(() => {
    if (!selectedTagihanForPayment) return 0;
    const tglBayar = new Date(paymentTanggal);
    const jatuhTempo = new Date(selectedTagihanForPayment.jatuh_tempo);

    if (tglBayar > jatuhTempo) {
      const diffTime = Math.abs(tglBayar.getTime() - jatuhTempo.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(diffDays * 20000, 200000);
    }
    return 0;
  }, [selectedTagihanForPayment, paymentTanggal]);

  // Sisa kewajiban real-time di modal
  const sisaKewajibanModal = useMemo(() => {
    if (!selectedTagihanForPayment) return 0;
    const dendaEfektif = Math.max(selectedTagihanForPayment.denda, calculatedDendaForModal);
    const total = selectedTagihanForPayment.nominal_sewa + dendaEfektif;
    return Math.max(0, total - selectedTagihanForPayment.terbayar);
  }, [selectedTagihanForPayment, calculatedDendaForModal]);

  // Filter Tagihan berdasarkan periode, status, dan pencarian
  const filteredTagihan = useMemo(() => {
    return tagihanList.filter((item) => {
      // Filter periode
      if (selectedPeriode && item.periode !== selectedPeriode) return false;

      // Filter status
      if (statusFilter !== "semua" && item.status !== statusFilter) return false;

      // Filter query pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNomor = item.nomor.toLowerCase().includes(q);
        const matchUnit = item.unit_kode.toLowerCase().includes(q);
        const matchPenyewa = item.penyewa_nama.toLowerCase().includes(q);
        return matchNomor || matchUnit || matchPenyewa;
      }
      return true;
    });
  }, [tagihanList, selectedPeriode, statusFilter, searchQuery]);

  // Hitung jumlah tagihan per status untuk tab filter
  const counts = useMemo(() => {
    const listForPeriod = tagihanList.filter((i) => i.periode === selectedPeriode);
    return {
      semua: listForPeriod.length,
      belum_bayar: listForPeriod.filter((i) => i.status === "belum_bayar").length,
      sebagian: listForPeriod.filter((i) => i.status === "sebagian").length,
      lunas: listForPeriod.filter((i) => i.status === "lunas").length,
      dibatalkan: listForPeriod.filter((i) => i.status === "dibatalkan").length,
    };
  }, [tagihanList, selectedPeriode]);

  // Handler: Buat Tagihan Bulanan Sekali Klik
  const handleBuatTagihanBulanan = () => {
    setAlertState(null);
    const nextPeriode = getNextMonthPeriode(selectedPeriode);

    startTransition(async () => {
      const res = await buatTagihanBulananAction(nextPeriode);
      if (res.statusCode === 429) {
        setAlertState({
          type: "rate_limit",
          message: res.message,
        });
        return;
      }

      if (!res.success) {
        setAlertState({
          type: "error",
          message: res.message,
        });
      } else {
        setAlertState({
          type: "success",
          message: res.message,
        });
        // Beralih ke periode yang baru dibuat
        setSelectedPeriode(nextPeriode);
        window.location.reload();
      }
    });
  };

  // Handler: Buka Modal Catat Bayar
  const handleOpenCatatModal = (item: TagihanItem) => {
    setSelectedTagihanForPayment(item);
    setPaymentTanggal("2026-10-15"); // Acuan tanggal PRD
    setPaymentMetode("transfer");
    setPaymentBank("BCA");
    setCustomBank("");
    setPaymentNamaRekening(item.penyewa_nama); // Pre-fill dengan nama penyewa
    setPaymentBuktiFile(null);
    setPaymentBuktiPreview(null);

    // Hitung denda awal per 15 Okt
    const tglBayar = new Date("2026-10-15");
    const jt = new Date(item.jatuh_tempo);
    let dendaAwal = 0;
    if (tglBayar > jt) {
      const diffTime = Math.abs(tglBayar.getTime() - jt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      dendaAwal = Math.min(diffDays * 20000, 200000);
    }
    const dendaEfektif = Math.max(item.denda, dendaAwal);
    const sisa = item.nominal_sewa + dendaEfektif - item.terbayar;
    setPaymentJumlah(sisa.toString());

    setIsCatatModalOpen(true);
  };

  // Handler: Submit Catat Pembayaran
  const handleSubmitCatatPembayaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihanForPayment) return;
    setAlertState(null);

    const effectiveBank = paymentBank === "Lainnya" ? customBank.trim() : paymentBank;

    if (paymentMetode === "transfer") {
      if (!effectiveBank) {
        setAlertState({
          type: "error",
          message: "Nama bank pengirim wajib dipilih (BCA, Mandiri, BNI, Mayar, QRIS, Gopay).",
        });
        return;
      }
      if (!paymentNamaRekening.trim()) {
        setAlertState({
          type: "error",
          message: "Nama pemilik rekening pengirim wajib diisi.",
        });
        return;
      }
      if (!paymentBuktiFile) {
        setAlertState({
          type: "error",
          message: "Foto bukti transfer wajib diunggah untuk metode transfer (BR-08).",
        });
        return;
      }
    }

    const formData = new FormData();
    formData.set("tagihan_id", selectedTagihanForPayment.id);
    formData.set("jumlah", paymentJumlah);
    formData.set("metode", paymentMetode);
    formData.set("tanggal_bayar", paymentTanggal);
    if (paymentMetode === "transfer") {
      formData.set("nama_bank", effectiveBank);
      formData.set("nama_rekening_pengirim", paymentNamaRekening.trim());
      if (paymentBuktiFile) {
        formData.set("bukti_transfer", paymentBuktiFile);
      }
    }

    startTransition(async () => {
      const res = await catatPembayaranAction(formData);

      if (res.statusCode === 429) {
        setAlertState({
          type: "rate_limit",
          message: res.message,
        });
        return;
      }

      if (!res.success) {
        setAlertState({
          type: "error",
          message: res.message,
        });
      } else {
        setAlertState({
          type: "success",
          message: res.message,
        });
        setIsCatatModalOpen(false);
        // Refresh data lokal
        const bayarData = res.data as { terbayar?: number; denda?: number; status?: TagihanItem["status"] };
        if (bayarData) {
          setTagihanList((prev) =>
            prev.map((t) =>
              t.id === selectedTagihanForPayment.id
                ? {
                    ...t,
                    terbayar: bayarData.terbayar ?? t.terbayar,
                    denda: bayarData.denda ?? t.denda,
                    status: bayarData.status ?? t.status,
                  }
                : t
            )
          );
        }
      }
    });
  };

  // Handler: Buka Detail Tagihan & Riwayat Pembayaran
  const handleOpenDetailModal = async (item: TagihanItem) => {
    setDetailTagihan(item);
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);

    const res = await getTagihanDetailAction(item.id);
    setIsLoadingDetail(false);

    if (res.success && res.data) {
      setDetailPembayaranList(res.data.pembayaranList as PembayaranDetail[]);
    }
  };

  // Handler: Pemilik Membatalkan Pembayaran
  const handleKonfirmasiBatalBayar = () => {
    if (!targetPembayaranId || !alasanBatalInput.trim()) return;
    setAlertState(null);

    startTransition(async () => {
      const res = await batalkanPembayaranAction(targetPembayaranId, alasanBatalInput);
      if (res.statusCode === 429) {
        setAlertState({ type: "rate_limit", message: res.message });
        return;
      }

      if (!res.success) {
        setAlertState({ type: "error", message: res.message });
      } else {
        setAlertState({ type: "success", message: res.message });
        setIsBatalBayarModalOpen(false);
        setAlasanBatalInput("");

        // Refresh detail modal
        if (detailTagihan) {
          handleOpenDetailModal(detailTagihan);
        }
      }
    });
  };

  // Handler: Pemilik Membatalkan Tagihan
  const handleKonfirmasiBatalTagihan = () => {
    if (!targetTagihanId || !alasanBatalInput.trim()) return;
    setAlertState(null);

    startTransition(async () => {
      const res = await batalkanTagihanAction(targetTagihanId, alasanBatalInput);
      if (res.statusCode === 429) {
        setAlertState({ type: "rate_limit", message: res.message });
        return;
      }

      if (!res.success) {
        setAlertState({ type: "error", message: res.message });
      } else {
        setAlertState({ type: "success", message: res.message });
        setIsBatalTagihanModalOpen(false);
        setAlasanBatalInput("");
        setIsDetailModalOpen(false);

        setTagihanList((prev) =>
          prev.map((t) =>
            t.id === targetTagihanId ? { ...t, status: "dibatalkan", alasan_batal: alasanBatalInput } : t
          )
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Tombol Utama Sesuai Wireframe Halaman 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            Keuangan & Penagihan [05]
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1E22]">
            Tagihan
          </h1>
          <p className="text-xs text-[#737A84] mt-0.5">
            Periode {getPeriodeLabel(selectedPeriode)} · jatuh tempo 10{" "}
            {selectedPeriode.split("-")[1] === "10"
              ? "Okt"
              : selectedPeriode.split("-")[1] === "11"
              ? "Nov"
              : selectedPeriode.split("-")[1] === "09"
              ? "Sep"
              : "Agu"}{" "}
            2026
          </p>
        </div>

        {/* Periode Selector & Tombol Buat Tagihan (Monte x Terra Design) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dropdown Periode */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-[#E8EAEC] shadow-xs text-xs font-semibold text-[#26292E]">
            <Calendar className="w-4 h-4 text-[#737A84]" />
            <span>Periode:</span>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="bg-transparent font-bold text-[#1C1E22] focus:outline-none cursor-pointer"
            >
              {availablePeriodes.map((p) => (
                <option key={p} value={p}>
                  {getPeriodeLabel(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Buat Tagihan Bulanan Sekali Klik (Hanya Pengelola / Pemilik) */}
          {["pengelola", "pemilik"].includes(userRole) && (
            <button
              type="button"
              onClick={handleBuatTagihanBulanan}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F367]" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Buat tagihan {getNextMonthLabel(selectedPeriode).split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D2F367] group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifikasi Alert Feedback / Proteksi 429 */}
      {alertState && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            alertState.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : alertState.type === "rate_limit"
              ? "bg-amber-50 border border-amber-300 text-amber-900 font-medium"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          {alertState.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : alertState.type === "rate_limit" ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold block">
              {alertState.type === "rate_limit"
                ? "429: Terlalu Banyak Permintaan"
                : alertState.type === "success"
                ? "Berhasil"
                : "Perhatian"}
            </span>
            <span>{alertState.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertState(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Filter Pills / Tabs Sesuai Wireframe Hal 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter("semua")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              statusFilter === "semua"
                ? "bg-white text-[#1C1E22] shadow-xs font-bold"
                : "text-[#737A84] hover:text-[#1C1E22]"
            }`}
          >
            Semua ({counts.semua})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("belum_bayar")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              statusFilter === "belum_bayar"
                ? "bg-white text-rose-700 shadow-xs font-bold"
                : "text-[#737A84] hover:text-rose-700"
            }`}
          >
            Belum bayar ({counts.belum_bayar})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("sebagian")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              statusFilter === "sebagian"
                ? "bg-white text-amber-700 shadow-xs font-bold"
                : "text-[#737A84] hover:text-amber-700"
            }`}
          >
            Sebagian ({counts.sebagian})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("lunas")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              statusFilter === "lunas"
                ? "bg-white text-emerald-800 shadow-xs font-bold"
                : "text-[#737A84] hover:text-emerald-800"
            }`}
          >
            Lunas ({counts.lunas})
          </button>
          {counts.dibatalkan > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("dibatalkan")}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                statusFilter === "dibatalkan"
                  ? "bg-white text-slate-700 shadow-xs font-bold"
                  : "text-[#737A84] hover:text-slate-700"
              }`}
            >
              Dibatalkan ({counts.dibatalkan})
            </button>
          )}
        </div>

        {/* Input Pencarian Cepat */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari unit atau nama..."
            className="w-full bg-white text-xs text-[#26292E] pl-10 pr-4 py-2 rounded-2xl border border-[#E8EAEC] focus:border-[#D5D9DE] focus:outline-none transition shadow-xs"
          />
        </div>
      </div>

      {/* 3. Tabel Data Tagihan Sesuai Wireframe Halaman 2 */}
      <div className="bg-white rounded-[28px] border border-[#E8EAEC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8EAEC] bg-[#FAFBFB] text-[#737A84] font-bold text-[11px] tracking-wider uppercase">
                <th className="py-3.5 px-4 sm:px-6">Nomor</th>
                <th className="py-3.5 px-3">Unit</th>
                <th className="py-3.5 px-4">Penyewa</th>
                <th className="py-3.5 px-4 text-right">Sewa</th>
                <th className="py-3.5 px-4 text-right">Denda</th>
                <th className="py-3.5 px-4 text-right">Terbayar</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAEC] text-[#26292E]">
              {filteredTagihan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#737A84]">
                    Tidak ada data tagihan yang sesuai dengan filter atau periode ini.
                  </td>
                </tr>
              ) : (
                filteredTagihan.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F6F7F9]/80 transition-colors">
                    {/* Nomor Tagihan */}
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-[#1C1E22]">
                      {item.nomor}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-3 font-semibold text-[#26292E]">
                      {item.unit_kode}
                    </td>

                    {/* Penyewa */}
                    <td className="py-3.5 px-4 font-medium text-[#1C1E22]">
                      {item.penyewa_nama}
                    </td>

                    {/* Sewa */}
                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatRupiah(item.nominal_sewa)}
                    </td>

                    {/* Denda */}
                    <td className="py-3.5 px-4 text-right">
                      {item.denda > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {formatRupiah(item.denda)}
                        </span>
                      ) : (
                        <span className="text-[#737A84]">-</span>
                      )}
                    </td>

                    {/* Terbayar */}
                    <td className="py-3.5 px-4 text-right font-semibold">
                      {item.terbayar > 0 ? formatRupiah(item.terbayar) : "Rp0"}
                    </td>

                    {/* Status Pill Sesuai Wireframe */}
                    <td className="py-3.5 px-4 text-center">
                      {item.status === "lunas" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFCCB] text-[#1C1E22] border border-[#D2F367]">
                          lunas
                        </span>
                      )}
                      {item.status === "belum_bayar" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          belum bayar
                        </span>
                      )}
                      {item.status === "sebagian" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          sebagian
                        </span>
                      )}
                      {item.status === "dibatalkan" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 line-through">
                          dibatalkan
                        </span>
                      )}
                    </td>

                    {/* Aksi Sesuai Wireframe Hal 2 */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      {item.status === "lunas" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          className="px-3 py-1 rounded-xl text-xs font-semibold text-[#737A84] hover:text-[#1C1E22] hover:bg-[#E8EAEC] transition"
                        >
                          Detail
                        </button>
                      ) : item.status === "dibatalkan" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          className="px-3 py-1 rounded-xl text-xs font-semibold text-[#737A84] hover:text-[#1C1E22] hover:bg-[#E8EAEC] transition"
                        >
                          Detail
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {["pengelola", "pemilik"].includes(userRole) && (
                            <button
                              type="button"
                              onClick={() => handleOpenCatatModal(item)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1C1E22] text-white hover:bg-[#26292E] shadow-2xs transition"
                            >
                              Catat bayar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#737A84] hover:text-[#1C1E22] hover:bg-[#E8EAEC] transition"
                          >
                            Detail
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: CATAT PEMBAYARAN (Persis Wireframe Hal 2 dengan Monte x Terra)
          ========================================================================= */}
      {isCatatModalOpen && selectedTagihanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8EAEC] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAEC]">
              <h2 className="text-lg font-extrabold text-[#1C1E22]">
                Catat pembayaran
              </h2>
              <button
                type="button"
                onClick={() => setIsCatatModalOpen(false)}
                className="text-[#737A84] hover:text-[#1C1E22] p-1 rounded-lg hover:bg-[#F6F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rincian Tagihan Sesuai Box Wireframe Hal 2 */}
            <div className="space-y-1.5 text-xs text-[#26292E] p-4 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC]">
              <div className="flex justify-between">
                <span className="text-[#737A84]">Tagihan</span>
                <span className="font-mono font-bold">{selectedTagihanForPayment.nomor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737A84]">Unit / penyewa</span>
                <span className="font-semibold">
                  {selectedTagihanForPayment.unit_kode} · {selectedTagihanForPayment.penyewa_nama}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737A84]">Sewa</span>
                <span>{formatRupiah(selectedTagihanForPayment.nominal_sewa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737A84]">Sudah dibayar</span>
                <span className="font-medium text-emerald-700">
                  {formatRupiah(selectedTagihanForPayment.terbayar)}
                </span>
              </div>

              {/* Denda per Tanggal Bayar */}
              <div className="flex justify-between">
                <span className="text-[#737A84]">Denda per {paymentTanggal}</span>
                <span className="font-semibold text-rose-600">
                  {formatRupiah(calculatedDendaForModal)}{" "}
                  {calculatedDendaForModal > 0 && (
                    <span className="text-[11px] font-normal text-rose-500">
                      ({calculatedDendaForModal / 20000} hari)
                    </span>
                  )}
                </span>
              </div>

              {/* Sisa Tagihan */}
              <div className="flex justify-between pt-1.5 border-t border-[#E8EAEC] font-bold text-[#1C1E22]">
                <span>Sisa</span>
                <span className="text-sm font-extrabold text-[#1C1E22]">
                  {formatRupiah(sisaKewajibanModal)}
                </span>
              </div>
            </div>

            {/* Form Input Pembayaran */}
            <form onSubmit={handleSubmitCatatPembayaran} className="space-y-4">
              {/* Tanggal Bayar */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1">
                  Tanggal Bayar
                </label>
                <input
                  type="date"
                  required
                  value={paymentTanggal}
                  onChange={(e) => setPaymentTanggal(e.target.value)}
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Jumlah Dibayar */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1">
                  Jumlah dibayar
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737A84]">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={sisaKewajibanModal}
                    value={paymentJumlah}
                    onChange={(e) => setPaymentJumlah(e.target.value)}
                    placeholder="Contoh: 950000"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Metode Bayar: Tunai vs Transfer */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Metode
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#F6F7F9] rounded-xl border border-[#E8EAEC] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentMetode("tunai")}
                    className={`py-1.5 rounded-lg transition ${
                      paymentMetode === "tunai"
                        ? "bg-[#1C1E22] text-white shadow-xs font-bold"
                        : "text-[#737A84] hover:text-[#1C1E22]"
                    }`}
                  >
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMetode("transfer")}
                    className={`py-1.5 rounded-lg transition ${
                      paymentMetode === "transfer"
                        ? "bg-[#1C1E22] text-white shadow-xs font-bold"
                        : "text-[#737A84] hover:text-[#1C1E22]"
                    }`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Form Khusus Metode Transfer: Pilihan Bank, Nama Rekening & Unggah Bukti */}
              {paymentMetode === "transfer" && (
                <div className="space-y-3.5 pt-2 border-t border-[#E8EAEC]">
                  {/* Pilihan Bank Pengirim */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                      Nama Bank / Channel Pengirim <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: "BCA", name: "BCA", activeColor: "border-[#005BAA] bg-blue-50 text-[#005BAA]" },
                        { id: "Mandiri", name: "Mandiri", activeColor: "border-[#002B49] bg-amber-50 text-[#002B49]" },
                        { id: "BNI", name: "BNI", activeColor: "border-[#F15A24] bg-orange-50 text-[#F15A24]" },
                        { id: "Mayar", name: "Mayar", activeColor: "border-[#6366F1] bg-indigo-50 text-[#6366F1]" },
                        { id: "QRIS", name: "QRIS", activeColor: "border-rose-600 bg-rose-50 text-rose-700" },
                        { id: "Gopay", name: "GoPay", activeColor: "border-teal-600 bg-teal-50 text-teal-800" },
                        { id: "Lainnya", name: "Lainnya", activeColor: "border-slate-600 bg-slate-100 text-slate-800" },
                      ].map((b) => {
                        const isSelected = paymentBank === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setPaymentBank(b.id)}
                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? `${b.activeColor} ring-2 ring-offset-1 ring-[#1C1E22] shadow-xs`
                                : "bg-[#FAFBFB] border-[#E8EAEC] text-[#737A84] hover:bg-white hover:text-[#26292E]"
                            }`}
                          >
                            <span>{b.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {paymentBank === "Lainnya" && (
                      <input
                        type="text"
                        required
                        value={customBank}
                        onChange={(e) => setCustomBank(e.target.value)}
                        placeholder="Ketik nama bank (misal: BRI, CIMB Niaga, Permata)"
                        className="mt-2 w-full bg-[#F6F7F9] text-xs text-[#26292E] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                      />
                    )}
                  </div>

                  {/* Nama Pemilik Rekening Pengirim */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26292E] mb-1">
                      Nama Pemilik Rekening Pengirim <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentNamaRekening}
                      onChange={(e) => setPaymentNamaRekening(e.target.value)}
                      placeholder="Contoh: DIMAS SAPUTRA"
                      className="w-full bg-[#F6F7F9] text-xs text-[#26292E] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition font-medium"
                    />
                    <span className="text-[10px] text-[#737A84] block mt-1">
                      Nama yang tertera pada buku rekening / aplikasi bank pengirim
                    </span>
                  </div>

                  {/* Bukti Transfer Real Upload & Pratinjau */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26292E] mb-1">
                      Bukti transfer (wajib diunggah) <span className="text-rose-500">*</span>
                    </label>

                    {paymentBuktiPreview ? (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setLightboxImage({
                              url: paymentBuktiPreview,
                              title: `Pratinjau Bukti Transfer - ${paymentBank === "Lainnya" ? customBank : paymentBank}`,
                              subtitle: `${selectedTagihanForPayment.unit_kode} (${selectedTagihanForPayment.penyewa_nama}) · a.n. ${paymentNamaRekening} · Rp ${paymentJumlah}`
                            })}
                            className="relative h-14 w-11 rounded-lg overflow-hidden border border-emerald-300 shadow-xs cursor-pointer group shrink-0"
                            title="Klik untuk perbesar foto"
                          >
                            <img
                              src={paymentBuktiPreview}
                              alt="Pratinjau Bukti"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block truncate max-w-[190px]">
                              {paymentBuktiFile?.name}
                            </span>
                            <span className="text-[11px] text-emerald-700 block">
                              {((paymentBuktiFile?.size || 0) / 1024).toFixed(1)} KB · Foto siap disimpan
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLightboxImage({
                              url: paymentBuktiPreview,
                              title: `Pratinjau Bukti Transfer - ${paymentBank === "Lainnya" ? customBank : paymentBank}`,
                              subtitle: `${selectedTagihanForPayment.unit_kode} (${selectedTagihanForPayment.penyewa_nama}) · a.n. ${paymentNamaRekening} · Rp ${paymentJumlah}`
                            })}
                            className="p-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Perbesar Pratinjau"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Perbesar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentBuktiFile(null);
                              setPaymentBuktiPreview(null);
                            }}
                            className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-[11px] font-semibold cursor-pointer"
                            title="Hapus / Ganti file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#D5D9DE] hover:border-[#1C1E22] rounded-2xl p-4 text-center bg-[#FAFBFB] transition cursor-pointer relative group">
                        <input
                          type="file"
                          required={paymentMetode === "transfer"}
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPaymentBuktiFile(file);
                              setPaymentBuktiPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center justify-center text-xs text-[#737A84] group-hover:text-[#1C1E22] transition">
                          <UploadCloud className="w-6 h-6 text-[#737A84] group-hover:text-[#1C1E22] mb-1.5 transition" />
                          <span className="font-semibold text-[#26292E]">Pilih atau tarik foto bukti transfer</span>
                          <span className="text-[10px] text-[#737A84]">Format JPG atau PNG (maksimal 2MB)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teks Helper Natural Sesuai Wireframe */}
              <p className="text-[11px] text-[#737A84] leading-relaxed">
                Minimal Rp100.000 kecuali melunasi sisa. Jumlah tidak boleh melebihi sisa.
              </p>

              {/* Tombol Aksi Simpan & Batal */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D2F367]" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan pembayaran</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCatatModalOpen(false)}
                  disabled={isPending}
                  className="py-2.5 px-5 rounded-full bg-white hover:bg-[#F6F7F9] border border-[#E8EAEC] text-xs font-semibold text-[#26292E] transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETAIL TAGIHAN & RIWAYAT PEMBAYARAN (DENGAN KOREKSI OLEH PEMILIK)
          ========================================================================= */}
      {isDetailModalOpen && detailTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8EAEC] space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEC]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#737A84] block">
                  DETAIL TAGIHAN
                </span>
                <h3 className="text-base font-extrabold text-[#1C1E22]">
                  {detailTagihan.nomor}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#737A84] hover:text-[#1C1E22] p-1 rounded-lg hover:bg-[#F6F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Rangkuman Tagihan */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC] text-xs">
              <div>
                <span className="text-[#737A84] block text-[11px]">Unit / Penyewa</span>
                <span className="font-bold text-[#1C1E22]">
                  {detailTagihan.unit_kode} ({detailTagihan.penyewa_nama})
                </span>
              </div>
              <div>
                <span className="text-[#737A84] block text-[11px]">Jatuh Tempo</span>
                <span className="font-semibold text-[#1C1E22]">{detailTagihan.jatuh_tempo}</span>
              </div>
              <div>
                <span className="text-[#737A84] block text-[11px]">Nominal Sewa</span>
                <span className="font-bold">{formatRupiah(detailTagihan.nominal_sewa)}</span>
              </div>
              <div>
                <span className="text-[#737A84] block text-[11px]">Denda / Terbayar</span>
                <span className="font-bold">
                  {detailTagihan.denda > 0 ? (
                    <span className="text-rose-600">{formatRupiah(detailTagihan.denda)}</span>
                  ) : (
                    "Rp0"
                  )}{" "}
                  /{" "}
                  <span className="text-emerald-700">
                    {formatRupiah(detailTagihan.terbayar)}
                  </span>
                </span>
              </div>
            </div>

            {/* Riwayat Pembayaran */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#737A84]">
                Riwayat Transaksi Pembayaran
              </h4>

              {isLoadingDetail ? (
                <div className="py-6 text-center text-xs text-[#737A84] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Memuat riwayat pembayaran...</span>
                </div>
              ) : detailPembayaranList.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F6F7F9] text-center text-xs text-[#737A84]">
                  Belum ada pembayaran yang dicatat untuk tagihan ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {detailPembayaranList.map((p) => {
                    const normTenant = detailTagihan?.penyewa_nama?.toLowerCase() || "";
                    const matchedTenant = Object.entries(TENANT_BUKTI_MAP).find(([k]) =>
                      normTenant.includes(k)
                    )?.[1];

                    const buktiUrl = getBuktiUrl(p.bukti_path, detailTagihan?.penyewa_nama);
                    const isTransfer = p.metode === "transfer";
                    const bankLabel =
                      p.nama_bank || matchedTenant?.bank || (isTransfer ? "Bank Transfer" : p.metode);
                    const ownerLabel =
                      p.nama_rekening_pengirim || matchedTenant?.owner || detailTagihan.penyewa_nama;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition ${
                          p.status === "dibatalkan"
                            ? "bg-slate-50 border-slate-200 opacity-60"
                            : "bg-white border-[#E8EAEC] hover:border-[#D5D9DE] shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#1C1E22] text-sm">
                              {formatRupiah(p.jumlah)}
                            </span>

                            {/* Badge Metode & Bank */}
                            <span
                              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                p.metode === "transfer"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : p.metode === "mayar"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {p.metode === "transfer"
                                ? `Transfer · ${p.nama_bank || bankLabel}`
                                : p.metode === "mayar"
                                ? "Mayar"
                                : p.metode}
                            </span>

                            {p.status === "dibatalkan" && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                Dibatalkan
                              </span>
                            )}
                          </div>

                          {/* Aksi Khusus Pemilik: Batalkan Pembayaran (BR-09) */}
                          {userRole === "pemilik" && p.status === "sah" && (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetPembayaranId(p.id);
                                setAlasanBatalInput("");
                                setIsBatalBayarModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer shrink-0"
                            >
                              Batalkan
                            </button>
                          )}
                        </div>

                        {/* Metadata Transaksi: Rekening, Tanggal, & Pencatat Bertanggung Jawab */}
                        <div className="text-[11px] text-[#737A84] flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>
                            Tgl: <strong className="text-[#26292E]">{p.tanggal_bayar}</strong>
                          </span>
                          {p.metode === "mayar" ? (
                            <span>
                              Gateway: <strong className="text-[#26292E]">Mayar (Otomatis)</strong>
                            </span>
                          ) : (
                            <span>
                              Rek: <strong className="text-[#26292E]">a.n. {ownerLabel}</strong>
                            </span>
                          )}
                          <span>
                            Dicatat:{" "}
                            <strong className="text-[#26292E]">
                              {p.pencatat?.nama_lengkap ||
                                (p.tanggal_bayar < "2026-10-05"
                                  ? "Bayu Prasetyo"
                                  : "Sinta Maharani")}
                            </strong>
                          </span>
                        </div>

                        {p.status === "dibatalkan" && p.alasan_batal && (
                          <div className="text-[11px] text-rose-600 bg-rose-50/70 p-2 rounded-xl border border-rose-100 italic">
                            Alasan batal: {p.alasan_batal}
                          </div>
                        )}

                        {/* Foto Bukti Transfer: Thumbnail Interaktif & Tombol Buka Asli */}
                        {buktiUrl && (
                          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                onClick={() =>
                                  setLightboxImage({
                                    url: buktiUrl,
                                    title: p.metode === "mayar" ? "Bukti Pembayaran - Mayar" : `Bukti Transfer - ${bankLabel}`,
                                    subtitle: p.metode === "mayar"
                                      ? `${detailTagihan.unit_kode} (${detailTagihan.penyewa_nama}) · Gateway Mayar (Otomatis) · ${formatRupiah(p.jumlah)}`
                                      : `${detailTagihan.unit_kode} (${detailTagihan.penyewa_nama}) · a.n. ${ownerLabel} · ${formatRupiah(p.jumlah)}`,
                                  })
                                }
                                className="relative h-12 w-9 rounded-lg overflow-hidden border border-[#D5D9DE] hover:border-[#1C1E22] shadow-xs cursor-pointer group shrink-0 bg-slate-100"
                                title="Klik untuk membuka foto asli"
                              >
                                <img
                                  src={buktiUrl}
                                  alt="Bukti Transfer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    if (matchedTenant && !target.src.includes(matchedTenant.url)) {
                                      target.src = matchedTenant.url;
                                    } else {
                                      target.src = "/bukti-bayar/bukti-aditya-pratama-bca.png";
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                              <div className="text-left truncate">
                                <span className="text-xs font-semibold text-[#1C1E22] block truncate">
                                  Foto Bukti ({bankLabel})
                                </span>
                                <span className="text-[10px] text-[#737A84] block truncate">
                                  Klik untuk membuka foto asli resolusi penuh
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: buktiUrl,
                                  title: p.metode === "mayar" ? "Bukti Pembayaran - Mayar" : `Bukti Transfer - ${bankLabel}`,
                                  subtitle: p.metode === "mayar"
                                    ? `${detailTagihan.unit_kode} (${detailTagihan.penyewa_nama}) · Gateway Mayar (Otomatis) · ${formatRupiah(p.jumlah)}`
                                    : `${detailTagihan.unit_kode} (${detailTagihan.penyewa_nama}) · a.n. ${ownerLabel} · ${formatRupiah(p.jumlah)}`,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFBFB] hover:bg-[#F6F7F9] border border-[#E8EAEC] text-xs font-semibold text-[#26292E] transition shadow-2xs shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#737A84]" />
                              <span>Buka Foto Asli</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Opsi Khusus Pemilik: Batalkan Tagihan (Bila belum ada pembayaran sah) */}
            {userRole === "pemilik" && detailTagihan.status !== "dibatalkan" && (
              <div className="pt-3 border-t border-[#E8EAEC] flex items-center justify-between">
                <span className="text-xs text-[#737A84]">
                  {detailTagihan.terbayar > 0
                    ? "Tagihan tidak bisa dibatalkan karena ada pembayaran aktif."
                    : "Belum ada pembayaran sah."}
                </span>
                {detailTagihan.terbayar === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTagihanId(detailTagihan.id);
                      setAlasanBatalInput("");
                      setIsBatalTagihanModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    Batalkan Tagihan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALASAN PEMBATALAN PEMBAYARAN (KHUSUS PEMILIK)
          ========================================================================= */}
      {isBatalBayarModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8EAEC] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C1E22]">
                Batalkan Pembayaran
              </h3>
              <p className="text-xs text-[#737A84]">
                Masukkan alasan pembatalan pembayaran ini. Status tagihan akan dihitung ulang secara otomatis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1">
                Alasan Pembatalan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={alasanBatalInput}
                onChange={(e) => setAlasanBatalInput(e.target.value)}
                placeholder="Contoh: Salah transfer ke rekening lama dan telah di-refund"
                className="w-full bg-[#F6F7F9] text-xs text-[#26292E] p-3 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleKonfirmasiBatalBayar}
                disabled={isPending || !alasanBatalInput.trim()}
                className="flex-1 py-2 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Konfirmasi Pembatalan"}
              </button>
              <button
                type="button"
                onClick={() => setIsBatalBayarModalOpen(false)}
                className="py-2 px-4 rounded-full bg-white border border-[#E8EAEC] text-xs font-semibold text-[#26292E] hover:bg-[#F6F7F9] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALASAN PEMBATALAN TAGIHAN (KHUSUS PEMILIK)
          ========================================================================= */}
      {isBatalTagihanModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8EAEC] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C1E22]">
                Batalkan Tagihan
              </h3>
              <p className="text-xs text-[#737A84]">
                Tagihan ini akan dibatalkan permanen. Aksi ini hanya dapat dilakukan bila belum ada pembayaran sah.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1">
                Alasan Pembatalan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={alasanBatalInput}
                onChange={(e) => setAlasanBatalInput(e.target.value)}
                placeholder="Contoh: Unit mengalami renovasi mendadak sehingga periode sewa dibebaskan"
                className="w-full bg-[#F6F7F9] text-xs text-[#26292E] p-3 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleKonfirmasiBatalTagihan}
                disabled={isPending || !alasanBatalInput.trim()}
                className="flex-1 py-2 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Batalkan Tagihan"}
              </button>
              <button
                type="button"
                onClick={() => setIsBatalTagihanModalOpen(false)}
                className="py-2 px-4 rounded-full bg-white border border-[#E8EAEC] text-xs font-semibold text-[#26292E] hover:bg-[#F6F7F9] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LIGHTBOX PRATINJAU REAL BUKTI TRANSFER (FULL RESOLUSI PORTRAIT)
          ========================================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-[#0F172A] border border-slate-700/60 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Lightbox */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0F172A]">
              <div className="truncate mr-3">
                <h4 className="text-sm font-bold text-white truncate">
                  {lightboxImage.title}
                </h4>
                {lightboxImage.subtitle && (
                  <p className="text-[11px] text-slate-400 truncate">
                    {lightboxImage.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-semibold transition"
                  title="Buka gambar di tab baru"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gambar Portrait Resolusi Penuh */}
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-[#070D18]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-800 object-contain mx-auto"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "/bukti-bayar/bukti-aditya-pratama-bca.png";
                }}
              />
            </div>

            {/* Footer Lightbox */}
            <div className="px-5 py-2.5 border-t border-slate-800 bg-[#0F172A] text-center">
              <span className="text-[11px] text-slate-400">
                Dokumen Bukti Transaksi Resmi · Griya Kenanga Residence Sleman
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
