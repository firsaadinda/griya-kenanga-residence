"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, UserRole } from "@/lib/auth/guard";

export interface GlobalSearchResult {
  id: string;
  category: "unit" | "penyewa" | "tagihan" | "kontrak" | "kerusakan";
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
  // Payload rincian lengkap untuk modal in-place / detail personal
  rawDetails?: {
    unit?: {
      id: string;
      kode: string;
      tipe: string;
      lantai: number;
      luas_m2?: number;
      harga_sewa_bulanan: number;
      status: string;
      keterangan?: string | null;
      penyewa_aktif?: string | null;
      kontrak_nomor?: string | null;
    };
    penyewa?: {
      id: string;
      nama_lengkap: string;
      email: string;
      no_hp?: string | null;
      peran: string;
      nik?: string | null;
      alamat_asal?: string | null;
      foto_ktp_path?: string | null;
      kontak_darurat_nama?: string | null;
      kontak_darurat_hp?: string | null;
      status_verifikasi?: string | null;
      alasan_tolak?: string | null;
      unit_kode?: string | null;
    };
    tagihan?: {
      id: string;
      nomor: string;
      periode: string;
      jatuh_tempo?: string;
      status: string;
      nominal_sewa: number;
      denda: number;
      terbayar: number;
      sisa: number;
      unit_kode?: string;
      penyewa_nama?: string;
      penyewa_email?: string;
      penyewa_hp?: string | null;
      alasan_batal?: string | null;
    };
    kontrak?: {
      id: string;
      nomor: string;
      status: string;
      tanggal_mulai: string;
      durasi_bulan: number;
      tanggal_selesai: string;
      harga_sewa_bulanan: number;
      unit_kode?: string;
      unit_tipe?: string;
      lantai?: number;
      penyewa_nama?: string;
      penyewa_email?: string;
      alasan_berakhir?: string | null;
    };
    kerusakan?: {
      id: string;
      nomor: string;
      judul: string;
      deskripsi?: string;
      kategori?: string;
      status: string;
      estimasi_biaya?: number | null;
      biaya_aktual?: number | null;
      alasan_tolak?: string | null;
      catatan?: string | null;
      unit_kode?: string;
      pelapor_nama?: string;
      pelapor_email?: string;
      dibuat_pada?: string;
      foto_paths?: string[];
    };
  };
}

export async function globalSearchAction(query: string): Promise<GlobalSearchResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 1) {
    return [];
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    return [];
  }

  const supabase = await createClient();
  const isPenyewa = profile.peran === "penyewa";
  const results: GlobalSearchResult[] = [];

  // Deteksi pencarian berdasarkan Blok (misal: "Blok A", "Blok B", "Blok C", "A", "B", "C")
  let targetBlockPrefix: string | null = null;
  const blokMatch = cleanQ.match(/^(?:blok\s*)?([abcABC])$/i) || cleanQ.match(/^blok\s*([abcABC])/i);
  if (blokMatch && blokMatch[1]) {
    targetBlockPrefix = blokMatch[1].toUpperCase() + "-"; // "A-", "B-", "C-"
  }

  // Normal wildcard pattern
  // Normal wildcard pattern
  const qPattern = `%${cleanQ}%`;

  try {
    // Cari profil yang namanya atau emailnya cocok dengan kata kunci pencarian
    let matchingProfileIds: string[] = [];
    if (!targetBlockPrefix) {
      const { data: matchedProfiles } = await supabase
        .from("profiles")
        .select("id")
        .or(`nama_lengkap.ilike.${qPattern},email.ilike.${qPattern}`)
        .limit(10);
      matchingProfileIds = (matchedProfiles || []).map((p: any) => p.id);
    }

    // ==========================================
    // PERSIAPKAN KUERI-KUERI PENCARIAN (PARALEL)
    // ==========================================

    // 1. Kueri Unit
    let unitQuery = supabase
      .from("unit")
      .select(`
        id,
        kode,
        tipe,
        lantai,
        luas_m2,
        harga_sewa_bulanan,
        status,
        keterangan,
        kontrak (
          id,
          nomor,
          status,
          penyewa:penyewa_id (
            nama_lengkap,
            email
          )
        )
      `)
      .order("kode", { ascending: true });

    if (targetBlockPrefix) {
      unitQuery = unitQuery.ilike("kode", `${targetBlockPrefix}%`).limit(8);
    } else {
      unitQuery = unitQuery.or(`kode.ilike.${qPattern},tipe.ilike.${qPattern}`).limit(5);
    }

    // 2. Kueri Kontrak (hanya pengelola/pemilik)
    let contractPromise: PromiseLike<{ data: any; error: any }> = Promise.resolve({ data: [], error: null });
    if (!isPenyewa) {
      let contractQuery = supabase
        .from("kontrak")
        .select(`
          id,
          nomor,
          status,
          tanggal_mulai,
          durasi_bulan,
          tanggal_selesai,
          harga_sewa_bulanan,
          alasan_berakhir,
          unit:unit_id (
            id,
            kode,
            tipe,
            lantai
          ),
          penyewa:penyewa_id (
            id,
            nama_lengkap,
            email
          )
        `)
        .order("nomor", { ascending: false });

      if (targetBlockPrefix) {
        contractQuery = contractQuery.not("unit", "is", null).limit(6);
      } else if (matchingProfileIds.length > 0) {
        contractQuery = contractQuery.or(`nomor.ilike.${qPattern},penyewa_id.in.(${matchingProfileIds.join(",")})`).limit(6);
      } else {
        contractQuery = contractQuery.or(`nomor.ilike.${qPattern}`).limit(5);
      }
      contractPromise = contractQuery;
    }

    // 3. Kueri Profil Penyewa (hanya pengelola/pemilik)
    let tenantPromise: PromiseLike<{ data: any; error: any }> = Promise.resolve({ data: [], error: null });
    if (!isPenyewa) {
      if (profile.peran === "pemilik") {
        tenantPromise = supabase
          .from("v_identitas_penyewa_pemilik")
          .select("*")
          .or(`nama_lengkap.ilike.${qPattern},email.ilike.${qPattern}`)
          .limit(5);
      } else {
        tenantPromise = supabase
          .from("profiles")
          .select(`
            id,
            nama_lengkap,
            email,
            no_hp,
            peran,
            identitas_penyewa:identitas_penyewa!penyewa_id (
              nik,
              alamat_asal,
              foto_ktp_path,
              kontak_darurat_nama,
              kontak_darurat_hp,
              status_verifikasi,
              alasan_tolak
            ),
            kontrak:kontrak!penyewa_id (
              id,
              nomor,
              status,
              unit:unit_id (kode)
            )
          `)
          .or(`nama_lengkap.ilike.${qPattern},email.ilike.${qPattern}`)
          .limit(5);
      }
    }

    // 4. Kueri Tagihan
    let tagihanQuery = supabase
      .from("tagihan")
      .select(`
        id,
        nomor,
        status,
        nominal_sewa,
        denda,
        terbayar,
        periode,
        jatuh_tempo,
        alasan_batal,
        kontrak:kontrak_id (
          id,
          nomor,
          unit:unit_id (kode),
          penyewa:penyewa_id (id, nama_lengkap, email, no_hp)
        )
      `)
      .order("nomor", { ascending: false });

    if (targetBlockPrefix) {
      tagihanQuery = tagihanQuery.limit(6);
    } else {
      tagihanQuery = tagihanQuery.or(`nomor.ilike.${qPattern}`).limit(6);
    }

    // 5. Kueri Laporan Kerusakan
    let reportQuery = supabase
      .from("laporan_kerusakan")
      .select(`
        id,
        nomor,
        judul,
        deskripsi,
        kategori,
        status,
        pelapor_id,
        estimasi_biaya,
        biaya_aktual,
        alasan_tolak,
        catatan,
        foto_paths,
        dibuat_pada,
        unit:unit_id (kode),
        pelapor:pelapor_id (nama_lengkap, email)
      `)
      .order("nomor", { ascending: false });

    if (targetBlockPrefix) {
      reportQuery = reportQuery.limit(6);
    } else if (matchingProfileIds.length > 0) {
      reportQuery = reportQuery.or(`nomor.ilike.${qPattern},judul.ilike.${qPattern},pelapor_id.in.(${matchingProfileIds.join(",")})`).limit(6);
    } else {
      reportQuery = reportQuery.or(`nomor.ilike.${qPattern},judul.ilike.${qPattern}`).limit(5);
    }

    // EKSEKUSI SELURUH KUERI SECARA PARALEL DALAM 1 ROUNDTRIP BATCH
    const [unitsRes, contractsRes, tenantsRes, tagihanRes, reportsRes] = await Promise.all([
      unitQuery,
      contractPromise,
      tenantPromise,
      tagihanQuery,
      reportQuery,
    ]);

    const units = unitsRes.data;
    const contracts = contractsRes.data;
    const tenants = tenantsRes.data;
    const tagihanList = tagihanRes.data;
    const reports = reportsRes.data;

    // 1. OLAH DATA HASIL UNIT
    if (units) {
      for (const u of units) {
        const activeK = Array.isArray(u.kontrak)
          ? u.kontrak.find((k: any) => k.status === "aktif")
          : null;
        const penyewaData = Array.isArray(activeK?.penyewa)
          ? activeK?.penyewa[0]
          : activeK?.penyewa;

        results.push({
          id: `unit-${u.id}`,
          category: "unit",
          categoryLabel: "Unit Kamar",
          title: `Unit ${u.kode} (${u.tipe.toUpperCase()})`,
          subtitle: `Lantai ${u.lantai} · Rp${u.harga_sewa_bulanan.toLocaleString("id-ID")}/bln · Status: ${u.status}`,
          badge: u.status,
          href: isPenyewa ? `/dashboard` : `/dashboard/unit?q=${encodeURIComponent(u.kode)}&targetId=${encodeURIComponent(u.id)}`,
          rawDetails: {
            unit: {
              id: u.id,
              kode: u.kode,
              tipe: u.tipe,
              lantai: u.lantai,
              luas_m2: Number(u.luas_m2 || 0),
              harga_sewa_bulanan: u.harga_sewa_bulanan,
              status: u.status,
              keterangan: u.keterangan,
              penyewa_aktif: penyewaData?.nama_lengkap || null,
              kontrak_nomor: activeK ? activeK.nomor : null,
            },
          },
        });
      }
    }

    // 2. OLAH DATA HASIL KONTRAK SEWA
    if (contracts && !isPenyewa) {
      for (const k of contracts) {
        const unitData = Array.isArray(k.unit) ? k.unit[0] : k.unit;
        const penyewaData = Array.isArray(k.penyewa) ? k.penyewa[0] : k.penyewa;

        // Jika pencarian blok spesifik, saring unit yang cocok dengan blok
        if (targetBlockPrefix && unitData?.kode && !unitData.kode.toUpperCase().startsWith(targetBlockPrefix)) {
          continue;
        }

        results.push({
          id: `kontrak-${k.id}`,
          category: "kontrak",
          categoryLabel: "Kontrak Sewa",
          title: `${k.nomor} · Unit ${unitData?.kode || "-"}`,
          subtitle: `Penyewa: ${penyewaData?.nama_lengkap || "-"} · ${k.durasi_bulan} bln · Rp${k.harga_sewa_bulanan.toLocaleString("id-ID")}/bln`,
          badge: k.status,
          href: `/dashboard/kontrak?q=${encodeURIComponent(k.nomor)}&targetId=${encodeURIComponent(k.id)}`,
          rawDetails: {
            kontrak: {
              id: k.id,
              nomor: k.nomor,
              status: k.status,
              tanggal_mulai: k.tanggal_mulai,
              durasi_bulan: k.durasi_bulan,
              tanggal_selesai: k.tanggal_selesai,
              harga_sewa_bulanan: k.harga_sewa_bulanan,
              unit_kode: unitData?.kode,
              unit_tipe: unitData?.tipe,
              lantai: unitData?.lantai,
              penyewa_nama: penyewaData?.nama_lengkap,
              penyewa_email: penyewaData?.email,
              alasan_berakhir: k.alasan_berakhir,
            },
          },
        });
      }
    }

    // 3. OLAH DATA HASIL PENYEWA
    if (tenants && !isPenyewa) {
      if (profile.peran === "pemilik") {
        for (const t of tenants) {
          results.push({
            id: `tenant-${t.penyewa_id}`,
            category: "penyewa",
            categoryLabel: "Profil Penyewa",
            title: t.nama_lengkap || "Penyewa",
            subtitle: `${t.email || "-"} ${t.no_hp ? `· ${t.no_hp}` : ""} · NIK: ${t.nik_tersamar || "-"}`,
            badge: t.status_verifikasi || "belum",
            href: `/dashboard/penyewa?q=${encodeURIComponent(t.nama_lengkap || "")}&targetId=${encodeURIComponent(t.penyewa_id || "")}`,
            rawDetails: {
              penyewa: {
                id: t.penyewa_id || "",
                nama_lengkap: t.nama_lengkap || "Penyewa",
                email: t.email || "",
                no_hp: t.no_hp,
                peran: "penyewa",
                nik: t.nik_tersamar,
                alamat_asal: null,
                status_verifikasi: t.status_verifikasi || "belum",
                alasan_tolak: t.alasan_tolak || null,
              },
            },
          });
        }
      } else {
        for (const t of tenants) {
          const identitas = Array.isArray(t.identitas_penyewa)
            ? t.identitas_penyewa[0]
            : t.identitas_penyewa;
          const activeContract = Array.isArray(t.kontrak)
            ? t.kontrak.find((k: any) => k.status === "aktif")
            : null;
          const activeUnit = Array.isArray(activeContract?.unit)
            ? activeContract?.unit[0]
            : activeContract?.unit;

          results.push({
            id: `tenant-${t.id}`,
            category: "penyewa",
            categoryLabel: "Profil Penyewa",
            title: t.nama_lengkap,
            subtitle: `${t.email} ${t.no_hp ? `· ${t.no_hp}` : ""} ${activeUnit?.kode ? `· Unit ${activeUnit.kode}` : ""}`,
            badge: identitas?.status_verifikasi || t.peran,
            href: `/dashboard/penyewa?q=${encodeURIComponent(t.nama_lengkap)}&targetId=${encodeURIComponent(t.id)}`,
            rawDetails: {
              penyewa: {
                id: t.id,
                nama_lengkap: t.nama_lengkap,
                email: t.email,
                no_hp: t.no_hp,
                peran: t.peran,
                nik: identitas?.nik || null,
                alamat_asal: identitas?.alamat_asal || null,
                foto_ktp_path: identitas?.foto_ktp_path || null,
                kontak_darurat_nama: identitas?.kontak_darurat_nama || null,
                kontak_darurat_hp: identitas?.kontak_darurat_hp || null,
                status_verifikasi: identitas?.status_verifikasi || "belum",
                alasan_tolak: identitas?.alasan_tolak || null,
                unit_kode: activeUnit?.kode || null,
              },
            },
          });
        }
      }
    }

    // 4. OLAH DATA HASIL TAGIHAN
    if (tagihanList) {
      for (const t of tagihanList) {
        const kontrakData = Array.isArray(t.kontrak) ? t.kontrak[0] : t.kontrak;
        const unitData = Array.isArray(kontrakData?.unit) ? kontrakData?.unit[0] : kontrakData?.unit;
        const penyewaData = Array.isArray(kontrakData?.penyewa) ? kontrakData?.penyewa[0] : kontrakData?.penyewa;

        // Jika pencarian blok spesifik, saring unit
        if (targetBlockPrefix && unitData?.kode && !unitData.kode.toUpperCase().startsWith(targetBlockPrefix)) {
          continue;
        }

        // Jika peran penyewa, batasi hanya tagihannya sendiri
        if (isPenyewa && penyewaData?.id !== profile.id) {
          continue;
        }

        const totalKewajiban = t.nominal_sewa + (t.denda || 0);
        const sisa = Math.max(0, totalKewajiban - (t.terbayar || 0));

        results.push({
          id: `tagihan-${t.id}`,
          category: "tagihan",
          categoryLabel: "Tagihan Sewa",
          title: `${t.nomor} · Unit ${unitData?.kode || "-"}`,
          subtitle: `${penyewaData?.nama_lengkap || "Penyewa"} · Sisa: Rp${sisa.toLocaleString("id-ID")} · Status: ${t.status.replace("_", " ")}`,
          badge: t.status.replace("_", " "),
          href: `/dashboard/tagihan?q=${encodeURIComponent(t.nomor)}&targetId=${encodeURIComponent(t.id)}`,
          rawDetails: {
            tagihan: {
              id: t.id,
              nomor: t.nomor,
              periode: t.periode,
              jatuh_tempo: t.jatuh_tempo,
              status: t.status,
              nominal_sewa: t.nominal_sewa,
              denda: t.denda || 0,
              terbayar: t.terbayar || 0,
              sisa,
              unit_kode: unitData?.kode,
              penyewa_nama: penyewaData?.nama_lengkap,
              penyewa_email: penyewaData?.email,
              penyewa_hp: penyewaData?.no_hp,
              alasan_batal: t.alasan_batal,
            },
          },
        });
      }
    }

    // 5. OLAH DATA HASIL LAPORAN KERUSAKAN
    if (reports) {
      for (const r of reports) {
        if (isPenyewa && r.pelapor_id !== profile.id) {
          continue;
        }

        const unitData = Array.isArray(r.unit) ? r.unit[0] : r.unit;
        const pelaporData = Array.isArray(r.pelapor) ? r.pelapor[0] : r.pelapor;

        // Jika pencarian blok spesifik, saring unit
        if (targetBlockPrefix && unitData?.kode && !unitData.kode.toUpperCase().startsWith(targetBlockPrefix)) {
          continue;
        }

        const rawPaths = Array.isArray(r.foto_paths) ? r.foto_paths : [r.foto_paths];
        const cleanPaths = rawPaths
          .flatMap((p: any) => (typeof p === "string" ? p.split(",").map((s) => s.trim()) : []))
          .filter(Boolean);

        results.push({
          id: `kerusakan-${r.id}`,
          category: "kerusakan",
          categoryLabel: "Laporan Kerusakan",
          title: `${r.nomor} · ${r.judul}`,
          subtitle: `Unit ${unitData?.kode || "-"} · Oleh: ${pelaporData?.nama_lengkap || "-"} · Status: ${r.status.replace("_", " ")}`,
          badge: r.status.replace("_", " "),
          href: `/dashboard/kerusakan?q=${encodeURIComponent(r.nomor)}&targetId=${encodeURIComponent(r.id)}`,
          rawDetails: {
            kerusakan: {
              id: r.id,
              nomor: r.nomor,
              judul: r.judul,
              deskripsi: r.deskripsi,
              kategori: r.kategori,
              status: r.status,
              estimasi_biaya: r.estimasi_biaya,
              biaya_aktual: r.biaya_aktual,
              alasan_tolak: r.alasan_tolak,
              catatan: r.catatan,
              unit_kode: unitData?.kode,
              pelapor_nama: pelaporData?.nama_lengkap,
              pelapor_email: pelaporData?.email,
              dibuat_pada: r.dibuat_pada,
              foto_paths: cleanPaths,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error in globalSearchAction:", error);
  }

  return results;
}
