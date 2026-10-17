import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatusCode } from "@/types/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codeParam = searchParams.get("code");
  const code = (codeParam ? parseInt(codeParam, 10) : 200) as HttpStatusCode;

  switch (code) {
    case 200:
      return apiSuccess({
        koneksi: "Aktif",
        aplikasi: "Griya Kenanga Residence",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      });

    case 400:
      return apiError(
        400,
        "Data yang dikirim salah atau kurang. Silakan periksa kembali formulir Anda.",
        {
          nomorKavling: ["Nomor kavling wajib diisi."],
          tipeRumah: ["Tipe rumah tidak valid."],
        }
      );

    case 401:
      return apiError(
        401,
        "Sesi login telah berakhir atau Anda belum masuk. Silakan login terlebih dahulu."
      );

    case 403:
      return apiError(
        403,
        "Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman atau data ini."
      );

    case 404:
      return apiError(
        404,
        "Data atau halaman yang Anda cari tidak ditemukan."
      );

    case 429:
      return apiError(
        429,
        "Permintaan terlalu sering. Harap tunggu beberapa saat sebelum mencoba kembali."
      );

    case 500:
      return apiError(
        500,
        "Terjadi gangguan pada server atau sistem kami. Tim kami sedang menanganinya."
      );

    default:
      return apiError(400, "Kode status tidak dikenali.");
  }
}
