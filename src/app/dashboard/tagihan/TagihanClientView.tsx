"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { UserRole } from "@/lib/auth/guard";
import {
  buatTagihanBulananAction,
  catatPembayaranAction,
  batalkanPembayaranAction,
  batalkanTagihanAction,
  getTagihanDetailAction,
} from "@/lib/actions/tagihan-actions";
import { buatInvoiceMayarAction } from "@/lib/actions/mayar-actions";
import { Pagination } from "@/components/ui/Pagination";
import { PrintableDocumentModal, InvoiceDocData } from "@/components/documents/PrintableDocumentModal";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { HttpStatusCode } from "@/types/api";
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
  Printer,
  ExternalLink,
  Calculator,
} from "lucide-react";
import Image from "next/image";

/** Cek apakah mayar_link valid (domain myr.lat / myr.id / mayar.id / mayar.io) */
function isMayarLinkValid(link?: string | null): link is string {
  if (!link) return false;
  try {
    const { hostname } = new URL(link);
    return (
      hostname.endsWith("myr.lat") ||
      hostname.endsWith("myr.id") ||
      hostname.endsWith("mayar.id") ||
      hostname.endsWith("mayar.io") ||
      hostname.endsWith("mayar.link")
    );
  } catch {
    return false;
  }
}

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
  mayar_invoice_id?: string | null;
  mayar_link?: string | null;
  mayar_jumlah?: number | null;
  dibayar_online_at?: string | null;
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
  referensi_mayar?: string | null;
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
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const targetIdParam = searchParams.get("targetId") || "";
  const nomorParam = searchParams.get("nomor") || "";

  const [tagihanList, setTagihanList] = useState<TagihanItem[]>(initialTagihanList);
  const [selectedPeriode, setSelectedPeriode] = useState<string>(activePeriode);
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>(qParam);

  // Sync if query param, targetId, or nomor changes
  useEffect(() => {
    if (qParam || targetIdParam || nomorParam) {
      if (qParam) setSearchQuery(qParam);
      const target = tagihanList.find(
        (t) =>
          (targetIdParam && t.id === targetIdParam) ||
          (nomorParam && t.nomor.toLowerCase() === nomorParam.toLowerCase()) ||
          (qParam && (
            t.nomor.toLowerCase().includes(qParam.toLowerCase()) ||
            t.penyewa_nama.toLowerCase().includes(qParam.toLowerCase()) ||
            t.unit_kode.toLowerCase().includes(qParam.toLowerCase())
          ))
      );
      if (target) {
        if (target.periode) {
          setSelectedPeriode(target.periode);
        }
        setStatusFilter("semua");
        handleOpenDetailModal(target);
      }
    }
  }, [qParam, targetIdParam, nomorParam, tagihanList]);

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

  // Modal Konfirmasi Buat Tagihan Bulanan (Pengelola / Pemilik)
  const [isConfirmBuatTagihanOpen, setIsConfirmBuatTagihanOpen] = useState(false);

  // Feedback Notification & Double Submit State
  const [alertState, setAlertState] = useState<{
    statusCode: HttpStatusCode;
    message: string;
    errors?: any;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter Blok Unit & Pagination
  const [blokFilter, setBlokFilter] = useState<string>("semua");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Mayar Payment State, Polling (5 detik selama 5 menit), & Denda Simulator
  const [isGeneratingMayar, setIsGeneratingMayar] = useState(false);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);
  const [activePollingId, setActivePollingId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [simulasiTanggal, setSimulasiTanggal] = useState<string>("2026-10-15");

  // Pembersihan Timer Polling saat Komponen Unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  // Format Tanggal dan Waktu Indonesia Lengkap dengan Jam
  const formatTanggalWaktuIndo = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return (
        new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d) + " WIB"
      );
    } catch {
      return isoString;
    }
  };

  // Printable Document Modal State
  const [printableDocState, setPrintableDocState] = useState<{
    isOpen: boolean;
    type: "invoice" | "kontrak";
    invoiceData?: InvoiceDocData | null;
  }>({
    isOpen: false,
    type: "invoice",
    invoiceData: null,
  });

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

      // Filter blok unit (A, B, C)
      if (blokFilter !== "semua") {
        if (!item.unit_kode.toUpperCase().startsWith(blokFilter.toUpperCase())) {
          return false;
        }
      }

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
  }, [tagihanList, selectedPeriode, statusFilter, blokFilter, searchQuery]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriode, statusFilter, blokFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTagihan.length / pageSize) || 1;
  const paginatedTagihan = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTagihan.slice(start, start + pageSize);
  }, [filteredTagihan, currentPage, pageSize]);

  // Kalkulasi Simulasi Denda Interaktif pada Detail Tagihan (BR-07)
  const simulasiHasil = useMemo(() => {
    if (!detailTagihan) return { hariTerlambat: 0, denda: 0, sisaPokok: 0, totalKewajiban: 0 };
    const sisaPokok = Math.max(0, detailTagihan.nominal_sewa - detailTagihan.terbayar);
    const jtDate = new Date(detailTagihan.jatuh_tempo);
    const simDate = new Date(simulasiTanggal);
    let hariTerlambat = 0;
    let denda = 0;

    if (simDate > jtDate) {
      const diffTime = simDate.getTime() - jtDate.getTime();
      hariTerlambat = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      denda = Math.min(hariTerlambat * 20000, 200000);
    }
    return {
      hariTerlambat,
      denda,
      sisaPokok,
      totalKewajiban: sisaPokok + denda,
    };
  }, [detailTagihan, simulasiTanggal]);

  // Handler: Bayar Online via Mayar API V2 Otomatis (Headless API)
  const handleBayarMayarOnline = async (targetTagihanId?: string) => {
    const targetId = targetTagihanId || detailTagihan?.id;
    if (!targetId) return;

    setCurrentProcessingId(targetId);
    setIsGeneratingMayar(true);
    setAlertState(null);

    try {
      // 1. Panggil route handler resmi POST /api/pembayaran/buat
      const res = await fetch("/api/pembayaran/buat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId }),
      });

      const resJson = await res.json();

      if (!res.ok || !resJson.success || !resJson.data) {
        setAlertState({
          statusCode: (res.status as HttpStatusCode) || 400,
          message: resJson.message || "Gagal membuat invoice Mayar.",
        });
        return;
      }

      const { mayar_link, mayar_invoice_id, mayar_jumlah } = resJson.data;

      // Update state detail tagihan jika modal sedang terbuka
      setDetailTagihan((prev) =>
        prev && prev.id === targetId
          ? { ...prev, mayar_link, mayar_invoice_id, mayar_jumlah }
          : prev
      );

      // Update state di daftar tabel
      setTagihanList((prev) =>
        prev.map((t) =>
          t.id === targetId
            ? { ...t, mayar_link, mayar_invoice_id, mayar_jumlah }
            : t
        )
      );

      setAlertState({
        statusCode: 200,
        message: "Tautan pembayaran Mayar resmi siap! Membuka halaman pembayaran di tab baru...",
      });

      // 2. Buka tautan Mayar di tab baru
      if (mayar_link) {
        window.open(mayar_link, "_blank", "noopener,noreferrer");
      }

      // 3. Mulai polling status invoice: setiap 5 detik selama 5 menit
      startPollingInvoiceStatus(targetId);
    } catch {
      setAlertState({
        statusCode: 500,
        message: "Terjadi kesalahan saat memproses pembayaran online Mayar.",
      });
    } finally {
      setIsGeneratingMayar(false);
      setCurrentProcessingId(null);
    }
  };

  // Handler: Buka Bukti Pembayaran Mayar (jika link ada langsung buka, jika kosong buat invoice Mayar baru lalu buka)
  const handleBukaBuktiMayar = async (item: TagihanItem) => {
    if (item.mayar_link && isMayarLinkValid(item.mayar_link)) {
      window.open(item.mayar_link, "_blank", "noopener,noreferrer");
      return;
    }
    // Jika mayar_link belum ada / null, buat invoice resmi di Mayar lalu buka
    await handleBayarMayarOnline(item.id);
  };

  // Polling Status Invoice: Periksa setiap 5 detik selama 5 menit (maks 60 kali)
  const startPollingInvoiceStatus = (targetId: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);

    setActivePollingId(targetId);
    let elapsedSeconds = 0;
    const intervalSeconds = 5;
    const maxSeconds = 300; // 5 menit

    const checkStatus = async () => {
      elapsedSeconds += intervalSeconds;
      try {
        const res = await getTagihanDetailAction(targetId);
        if (res.success && res.data) {
          const { tagihan, pembayaranList } = res.data;
          if (tagihan.status === "lunas") {
            // Tagihan LUNAS terkonfirmasi! Hentikan polling
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
            setActivePollingId(null);

            // Perbarui daftar tagihan di tabel
            setTagihanList((prev) =>
              prev.map((t) =>
                t.id === targetId
                  ? {
                      ...t,
                      status: "lunas",
                      terbayar: tagihan.terbayar,
                      dibayar_online_at: tagihan.dibayar_online_at,
                      mayar_link: tagihan.mayar_link,
                      mayar_invoice_id: tagihan.mayar_invoice_id,
                      mayar_jumlah: tagihan.mayar_jumlah,
                    }
                  : t
              )
            );

            // Perbarui detail tagihan jika modal sedang terbuka
            setDetailTagihan((prev) => {
              if (prev && prev.id === targetId) {
                return {
                  ...prev,
                  status: "lunas",
                  terbayar: tagihan.terbayar,
                  dibayar_online_at: tagihan.dibayar_online_at,
                  mayar_link: tagihan.mayar_link,
                  mayar_invoice_id: tagihan.mayar_invoice_id,
                  mayar_jumlah: tagihan.mayar_jumlah,
                };
              }
              return prev;
            });

            if (pembayaranList) {
              setDetailPembayaranList(pembayaranList as PembayaranDetail[]);
            }

            setAlertState({
              statusCode: 200,
              message: `Tagihan ${tagihan.nomor} berhasil diverifikasi LUNAS via Mayar! Waktu pembayaran otomatis tercatat.`,
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Polling invoice status error:", err);
      }

      if (elapsedSeconds >= maxSeconds) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        setActivePollingId(null);
      }
    };

    pollingIntervalRef.current = setInterval(checkStatus, intervalSeconds * 1000);

    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      setActivePollingId(null);
    }, maxSeconds * 1000);
  };

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
          statusCode: 429,
          message: res.message,
        });
        return;
      }

      if (!res.success) {
        setAlertState({
          statusCode: res.statusCode || 400,
          message: res.message,
        });
      } else {
        setAlertState({
          statusCode: 200,
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
          statusCode: 400,
          message: "Nama bank pengirim wajib dipilih (BCA, Mandiri, BNI, Mayar, QRIS, Gopay).",
        });
        return;
      }
      if (!paymentNamaRekening.trim()) {
        setAlertState({
          statusCode: 400,
          message: "Nama pemilik rekening pengirim wajib diisi.",
        });
        return;
      }
      if (!paymentBuktiFile) {
        setAlertState({
          statusCode: 400,
          message: "Foto bukti transfer wajib diunggah untuk metode transfer.",
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
          statusCode: 429,
          message: res.message,
        });
        return;
      }

      if (!res.success) {
        setAlertState({
          statusCode: res.statusCode || 400,
          message: res.message,
          errors: res.errors,
        });
      } else {
        setAlertState({
          statusCode: 200,
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
        setAlertState({ statusCode: 429, message: res.message });
        return;
      }

      if (!res.success) {
        setAlertState({ statusCode: res.statusCode || 400, message: res.message });
      } else {
        setAlertState({ statusCode: 200, message: res.message });
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
        setAlertState({ statusCode: 429, message: res.message });
        return;
      }

      if (!res.success) {
        setAlertState({ statusCode: res.statusCode || 400, message: res.message });
      } else {
        setAlertState({ statusCode: 200, message: res.message });
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
            Keuangan & Penagihan
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
              onClick={() => setIsConfirmBuatTagihanOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Buat tagihan {getNextMonthLabel(selectedPeriode).split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#88BC3C] group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifikasi Alert Feedback Standar 7 Kode Status */}
      {alertState && (
        <AlertBanner
          statusCode={alertState.statusCode}
          message={alertState.message}
          errors={alertState.errors}
          onDismiss={() => setAlertState(null)}
        />
      )}

      {/* 2. Filter Pills / Tabs Sesuai Wireframe Hal 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
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

          {/* Filter Blok Unit (A, B, C) */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs font-semibold">
            <span className="text-[10px] text-[#737A84] px-2 uppercase font-bold">Blok:</span>
            {["semua", "A", "B", "C"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBlokFilter(b)}
                className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                  blokFilter === b
                    ? "bg-white text-[#1C1E22] shadow-xs font-bold"
                    : "text-[#737A84] hover:text-[#1C1E22]"
                }`}
              >
                {b === "semua" ? "Semua" : `Blok ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Input Pencarian Cepat */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari unit atau nama..."
            className="w-full bg-white text-xs text-[#26292E] pl-10 pr-9 py-2 rounded-2xl border border-[#E8EAEC] focus:border-[#D5D9DE] focus:outline-none transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-0.5 rounded-full cursor-pointer"
              title="Reset pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
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
              {paginatedTagihan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#737A84]">
                    Tidak ada data tagihan yang sesuai dengan filter atau periode ini.
                  </td>
                </tr>
              ) : (
                paginatedTagihan.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F6F7F9]/80 transition-colors">
                    {/* Nomor Tagihan: Klik untuk buka E-Receipt (jika lunas) atau Detail Modal */}
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-[#1C1E22]">
                      {item.status === "lunas" ? (
                        <a
                          href={`/ereceipt/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline transition-colors inline-flex items-center gap-1"
                          title="Buka Invoice / E-Receipt Resmi Mayar"
                        >
                          <span>{item.nomor}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          className="hover:text-blue-600 hover:underline transition-colors text-left font-mono font-semibold"
                          title="Buka Detail Tagihan"
                        >
                          {item.nomor}
                        </button>
                      )}
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

                    {/* Status Pill Sesuai Wireframe - Terpusat Vertikal & Horizontal */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <div className="flex items-center justify-center h-8">
                        {item.status === "lunas" && (
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F2F7EC] text-[#4A6C2F] border border-[#5E8826]/30 leading-none">
                            lunas
                          </span>
                        )}
                        {item.status === "belum_bayar" && (
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 leading-none">
                            belum bayar
                          </span>
                        )}
                        {item.status === "sebagian" && (
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 leading-none">
                            sebagian
                          </span>
                        )}
                        {item.status === "dibatalkan" && (
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 line-through leading-none">
                            dibatalkan
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Aksi: Detail (kiri) | Lihat Bukti / Bayar Online (kanan) - Sejajar Vertikal Presisi */}
                    <td className="py-3.5 px-4 sm:px-6 align-middle text-right whitespace-nowrap">
                      {item.status === "lunas" ? (
                        <div className="flex items-center justify-end gap-2 h-8">
                          {/* Detail – kiri */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition cursor-pointer"
                          >
                            Detail
                          </button>
                          {/* Lihat Bukti – kanan: Untuk tagihan LUNAS, SELALU membuka E-Receipt Resmi (bukan link bayar Mayar) */}
                          <a
                            href={`/ereceipt/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer shadow-2xs leading-none"
                            title="Buka Invoice / E-Receipt Resmi di Tab Baru"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Lihat Bukti</span>
                          </a>
                        </div>
                      ) : item.status === "dibatalkan" ? (
                        /* Dibatalkan – hanya Detail */
                        <div className="flex items-center justify-end h-8">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      ) : (
                        /* Belum bayar / sebagian: Detail (kiri) | Bayar Online (kanan) */
                        <div className="flex items-center justify-end gap-2 h-8">
                          {/* Detail – kiri */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition cursor-pointer"
                          >
                            Detail
                          </button>
                          {/* Bayar Online – kanan (Admin/Owner saja) */}
                          {(userRole === "pengelola" || userRole === "pemilik") && (
                            <button
                              type="button"
                              onClick={() => handleBayarMayarOnline(item.id)}
                              disabled={isGeneratingMayar && currentProcessingId === item.id}
                              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-[#1C1E22] text-[#88BC3C] hover:bg-[#26292E] shadow-2xs transition cursor-pointer disabled:opacity-50 leading-none border border-white/10"
                              title="Bayar Online via Mayar"
                            >
                              {isGeneratingMayar && currentProcessingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C] shrink-0" />
                              ) : activePollingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>Bayar Online</span>
                            </button>
                          )}
                          {/* Catat bayar manual – pengelola saja */}
                          {userRole === "pengelola" && (
                            <button
                              type="button"
                              onClick={() => handleOpenCatatModal(item)}
                              className="inline-flex items-center justify-center h-8 px-3.5 rounded-full text-xs font-semibold bg-[#F6F7F9] text-[#1C1E22] hover:bg-[#E8EAEC] border border-[#E8EAEC] shadow-2xs transition cursor-pointer leading-none"
                            >
                              Catat bayar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Table Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E8EAEC]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTagihan.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="tagihan"
          />
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

                  {/* Bukti Transfer Real Upload & Pratinjau (Disembunyikan secara visual sesuai kebijakan 100% Full Mayar) */}
                  {false && (
                    <div>
                      <label className="block text-xs font-semibold text-[#26292E] mb-1">
                        Bukti transfer (wajib diunggah) <span className="text-rose-500">*</span>
                      </label>

                      {paymentBuktiPreview ? (
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setLightboxImage({
                                url: paymentBuktiPreview || "",
                                title: `Pratinjau Bukti Transfer - ${paymentBank === "Lainnya" ? customBank : paymentBank}`,
                                subtitle: `${selectedTagihanForPayment?.unit_kode || ""} (${selectedTagihanForPayment?.penyewa_nama || ""}) · a.n. ${paymentNamaRekening} · Rp ${paymentJumlah}`
                              })}
                              className="relative h-14 w-11 rounded-lg overflow-hidden border border-emerald-300 shadow-xs cursor-pointer group shrink-0"
                              title="Klik untuk perbesar foto"
                            >
                              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800">
                                <FileText className="w-5 h-5 text-emerald-700" />
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
                                url: paymentBuktiPreview || "",
                                title: `Pratinjau Bukti Transfer - ${paymentBank === "Lainnya" ? customBank : paymentBank}`,
                                subtitle: `${selectedTagihanForPayment?.unit_kode || ""} (${selectedTagihanForPayment?.penyewa_nama || ""}) · a.n. ${paymentNamaRekening} · Rp ${paymentJumlah}`
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
                  )}
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
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

            {/* Tombol Aksi: Unduh PDF / E-Kwitansi & Bayar Online Mayar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPrintableDocState({
                    isOpen: true,
                    type: "invoice",
                    invoiceData: {
                      nomor: detailTagihan.nomor,
                      periode: detailTagihan.periode,
                      jatuh_tempo: detailTagihan.jatuh_tempo,
                      unit_kode: detailTagihan.unit_kode,
                      unit_tipe: detailTagihan.unit_tipe,
                      penyewa_nama: detailTagihan.penyewa_nama,
                      penyewa_email: detailTagihan.penyewa_email,
                      penyewa_hp: detailTagihan.penyewa_hp,
                      nominal_sewa: detailTagihan.nominal_sewa,
                      denda: detailTagihan.denda,
                      terbayar: detailTagihan.terbayar,
                      status: detailTagihan.status,
                      pembayaranList: detailPembayaranList.filter((p) => p.status === "sah"),
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8EAEC] bg-white hover:bg-[#F6F7F9] text-xs font-semibold text-[#26292E] shadow-2xs transition cursor-pointer"
              >
                <Image
                  src="/logo-griya-kenanga.png"
                  alt="Griya Kenanga"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <Printer className="w-3.5 h-3.5 text-[#737A84]" />
                <span>Unduh PDF / E-Kwitansi</span>
              </button>

              {/* Tombol Bayar Online via Mayar untuk Admin & Owner (Bila belum lunas) */}
              {/* Tombol Bayar Online untuk tagihan BELUM LUNAS */}
              {detailTagihan.status !== "lunas" &&
                detailTagihan.status !== "dibatalkan" && (
                  <button
                    type="button"
                    onClick={() => handleBayarMayarOnline(detailTagihan.id)}
                    disabled={isGeneratingMayar && currentProcessingId === detailTagihan.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingMayar && currentProcessingId === detailTagihan.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
                        <span>Membuat Invoice Mayar...</span>
                      </>
                    ) : activePollingId === detailTagihan.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Menunggu Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Bayar Online</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#88BC3C]" />
                      </>
                    )}
                  </button>
                )}

              {/* Requirement: Untuk invoice yang LUNAS, tombol Lihat Bukti membuka /ereceipt/[id] */}
              {detailTagihan.status === "lunas" && (
                <a
                  href={`/ereceipt/${detailTagihan.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  title="Buka Invoice / E-Receipt Resmi Lunas di Tab Baru"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Lihat Bukti (E-Receipt Resmi)</span>
                </a>
              )}
            </div>

            {/* Banner LUNAS: Conditional rendering metode Mayar vs Tunai */}
            {detailTagihan.status === "lunas" && (() => {
              const lastSahBayar = detailPembayaranList.filter((p) => p.status === "sah").pop();
              const isTunai = lastSahBayar?.metode === "tunai";
              const namaPencatat = lastSahBayar?.pencatat?.nama_lengkap ||
                (lastSahBayar?.tanggal_bayar && lastSahBayar.tanggal_bayar < "2026-10-05"
                  ? "Bayu Prasetyo"
                  : "Sinta Maharani");

              return (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {isTunai ? "LUNAS" : "Lunas"}
                        </span>
                        <span className="text-xs font-bold text-emerald-950">
                          {isTunai ? "LUNAS" : "Terkonfirmasi Lunas (Mayar)"}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 block mt-0.5">
                        {isTunai ? (
                          <>
                            Dicatat: <strong className="font-semibold text-emerald-950">{namaPencatat}</strong>
                            {lastSahBayar?.tanggal_bayar && (
                              <span className="text-emerald-700 ml-1.5 font-normal">
                                ({formatTanggalWaktuIndo(lastSahBayar.tanggal_bayar)})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            Waktu dibayar otomatis:{" "}
                            <strong className="font-semibold text-emerald-950">
                              {formatTanggalWaktuIndo(detailTagihan.dibayar_online_at)}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/ereceipt/${detailTagihan.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto"
                    title="Buka E-Receipt Resmi Lunas di Tab Baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Bukti</span>
                  </a>
                </div>
              );
            })()}

            {/* Banner Indikator Polling Realtime Aktif */}
            {activePollingId === detailTagihan.id && detailTagihan.status !== "lunas" && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">Menunggu Konfirmasi Pembayaran Mayar...</span>
                  <span className="text-[11px] text-amber-700">
                    Sistem memeriksa status invoice secara berkala setiap 5 detik. Saat Anda menyelesaikan pembayaran di Mayar, status invoice akan langsung otomatis berubah menjadi LUNAS.
                  </span>
                </div>
              </div>
            )}

            {/* Tautan Mayar Aktif (jika sudah digenerate) */}
            {detailTagihan.mayar_link && detailTagihan.status !== "lunas" && (
              <div className="p-3 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC] flex items-center justify-between gap-3 text-xs">
                <div className="truncate min-w-0">
                  <span className="text-[10px] font-bold text-[#737A84] block uppercase">
                    Tautan Pembayaran Mayar Resmi (Otomatis)
                  </span>
                  <a
                    href={detailTagihan.mayar_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline font-mono truncate block"
                  >
                    {detailTagihan.mayar_link}
                  </a>
                </div>
                <a
                  href={detailTagihan.mayar_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C1E22] text-[#88BC3C] text-[11px] font-semibold shrink-0 hover:bg-[#26292E] transition border border-white/10"
                >
                  <span>Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Kalkulator Pratinjau Denda Interaktif (BR-07) */}
            <div className="p-3.5 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#1C1E22]">
                  <Calculator className="w-4 h-4 text-[#737A84]" />
                  <span>Kalkulator Simulasi Denda</span>
                </div>
                <span className="text-[10px] text-[#737A84]">
                  Rp20.000/hari &bull; Maks Rp200.000
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-auto flex-1">
                  <label className="block text-[10px] font-semibold text-[#737A84] mb-1">
                    Simulasi Tanggal Pembayaran
                  </label>
                  <input
                    type="date"
                    value={simulasiTanggal}
                    onChange={(e) => setSimulasiTanggal(e.target.value)}
                    className="w-full bg-white text-xs text-[#1C1E22] p-2 rounded-xl border border-[#D5D9DE] focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-auto flex-1 bg-white p-2.5 rounded-xl border border-[#E8EAEC] text-right">
                  <span className="text-[10px] text-[#737A84] block">
                    Keterlambatan: <strong>{simulasiHasil.hariTerlambat} hari</strong>
                  </span>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="text-xs font-bold text-rose-600">
                      Denda: {formatRupiah(simulasiHasil.denda)}
                    </span>
                    {simulasiHasil.denda >= 200000 && (
                      <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                        MAKS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-[#1C1E22] block">
                    Total: {formatRupiah(simulasiHasil.totalKewajiban)}
                  </span>
                </div>
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
                    // Pertahankan pemanggilan fungsi agar tidak memicu error dependensi
                    const _buktiUrl = getBuktiUrl(p.bukti_path, detailTagihan?.penyewa_nama);
                    const isMayar = p.metode === "mayar";
                    const mayarReceiptUrl = `/ereceipt/${detailTagihan.id}`;

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

                            {/* Badge Metode: Hanya MAYAR dan TUNAI */}
                            <span
                              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                isMayar
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isMayar ? "MAYAR" : "TUNAI"}
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

                        {/* Metadata Transaksi: Hanya Mayar dan Tunai (tanpa transfer manual) */}
                        <div className="text-[11px] text-[#737A84] flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>
                            Tgl: <strong className="text-[#26292E]">{p.tanggal_bayar}</strong>
                          </span>
                          {isMayar ? (
                            <span>
                              Gateway: <strong className="text-[#26292E]">Mayar (Otomatis)</strong>
                            </span>
                          ) : (
                            <span>
                              Keterangan: <strong className="text-[#26292E]">Pembayaran Tunai</strong>
                            </span>
                          )}
                          {!isMayar && (
                            <span>
                              Dicatat:{" "}
                              <strong className="text-[#26292E]">
                                {p.pencatat?.nama_lengkap ||
                                  (p.tanggal_bayar < "2026-10-05"
                                    ? "Bayu Prasetyo"
                                    : "Sinta Maharani")}
                              </strong>
                            </span>
                          )}
                        </div>

                        {p.status === "dibatalkan" && p.alasan_batal && (
                          <div className="text-[11px] text-rose-600 bg-rose-50/70 p-2 rounded-xl border border-rose-100 italic">
                            Alasan batal: {p.alasan_batal}
                          </div>
                        )}

                        {/* Kondisi 1 (Mayar): Tampilkan kotak E-Receipt Resmi Mayar dan tombol Lihat Bukti (tag <a> standar) */}
                        {isMayar && (
                          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                <ExternalLink className="w-4 h-4 text-emerald-700" />
                              </div>
                              <div className="text-left truncate">
                                <span className="text-xs font-semibold text-[#1C1E22] block truncate">
                                  E-Receipt Resmi Mayar
                                </span>
                                <span className="text-[10px] text-[#737A84] block truncate">
                                  Bukti pembayaran sah terkonfirmasi otomatis via Mayar Gateway
                                </span>
                              </div>
                            </div>

                            <a
                              href={`/ereceipt/${detailTagihan.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition shadow-2xs shrink-0 cursor-pointer"
                              title="Buka E-Receipt Resmi Lunas di Tab Baru"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Lihat Bukti</span>
                            </a>
                          </div>
                        )}

                        {/* Kondisi 2 (Tunai): SEMBUNYIKAN kotak E-Receipt dan tombol Mayar, tampilkan teks keterangan sederhana "Pembayaran Tunai" dengan ikon kuning */}
                        {!isMayar && (
                          <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 text-xs text-[#737A84]">
                            <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-medium text-[#26292E]">Pembayaran Tunai</span>
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1C1E22]">
                  Batalkan Pembayaran
                </h3>
                <p className="text-xs text-[#737A84]">
                  Masukkan alasan pembatalan pembayaran ini. Status tagihan akan dihitung ulang secara otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatalBayarModalOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1C1E22]">
                  Batalkan Tagihan
                </h3>
                <p className="text-xs text-[#737A84]">
                  Tagihan ini akan dibatalkan permanen. Aksi ini hanya dapat dilakukan bila belum ada pembayaran sah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatalTagihanModalOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
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
      {/* Lightbox disembunyikan secara visual sesuai kebijakan 100% Full Mayar (tanpa rendering <img>) */}
      {Boolean(lightboxImage) && false && null}

      {/* MODAL KONFIRMASI BUAT TAGIHAN BULANAN (PENGELOLA / PEMILIK - BR-06) */}
      {isConfirmBuatTagihanOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8EAEC] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Konfirmasi Pembuatan Tagihan
                </span>
                <h3 className="text-base font-bold text-[#1C1E22]">
                  Buat Tagihan {getNextMonthLabel(selectedPeriode)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmBuatTagihanOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#26292E] flex items-center justify-center transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#737A84]">Periode Tagihan:</span>
                <span className="font-semibold text-[#1C1E22]">{getNextMonthLabel(selectedPeriode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737A84]">Jatuh Tempo:</span>
                <span className="font-semibold text-[#1C1E22]">Tanggal 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737A84]">Sasaran Tagihan:</span>
                <span className="font-semibold text-[#1C1E22]">Seluruh unit dengan kontrak aktif</span>
              </div>
            </div>

            <p className="text-xs text-[#737A84] leading-relaxed">
              Sistem akan memvalidasi seluruh kontrak sewa berstatus aktif dan menerbitkan invoice bernomor urut resmi (INV-YYYYMM-XXXX). Unit yang sudah memiliki invoice pada periode ini tidak akan dibuatkan tagihan ganda. Apakah Anda yakin ingin memproses?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmBuatTagihanOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmBuatTagihanOpen(false);
                  handleBuatTagihanBulanan();
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Ya, Terbitkan Tagihan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRATINJAU DOKUMEN CETAK & SIMPAN SEBAGAI PDF (A4 PRINT STYLESHEET)
          ========================================================================= */}
      <PrintableDocumentModal
        isOpen={printableDocState.isOpen}
        onClose={() => setPrintableDocState({ isOpen: false, type: "invoice", invoiceData: null })}
        type={printableDocState.type}
        invoiceData={printableDocState.invoiceData}
      />
    </div>
  );
}
