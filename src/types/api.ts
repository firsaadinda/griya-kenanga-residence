export type HttpStatusCode = 200 | 400 | 401 | 403 | 404 | 429 | 500;

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: HttpStatusCode;
  message: string;
  data?: T;
  errors?: Record<string, string[]> | string | null;
  timestamp: string;
}

export interface StatusMeta {
  code: HttpStatusCode;
  title: string;
  defaultMessage: string;
  meaning: string;
}

export const HTTP_STATUS_CATALOG: Record<HttpStatusCode, StatusMeta> = {
  200: {
    code: 200,
    title: "Berhasil",
    defaultMessage: "Aksi berhasil disimpan.",
    meaning: "Permintaan telah berhasil diproses dan disimpan ke sistem.",
  },
  400: {
    code: 400,
    title: "Data Kurang atau Salah",
    defaultMessage: "Data yang dikirim salah atau kurang. Silakan periksa kembali formulir Anda.",
    meaning: "Validasi form gagal atau melanggar aturan bisnis (business rules).",
  },
  401: {
    code: 401,
    title: "Belum Login / Sesi Habis",
    defaultMessage: "Sesi login telah berakhir atau Anda belum masuk. Silakan login terlebih dahulu.",
    meaning: "Pengguna mencoba mengakses halaman atau API internal tanpa sesi login aktif.",
  },
  403: {
    code: 403,
    title: "Akses Ditolak",
    defaultMessage: "Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman atau data ini.",
    meaning: "Pengguna sudah login, tetapi perannya tidak berhak mengakses fitur ini. Jangan pernah menukar dengan 401!",
  },
  404: {
    code: 404,
    title: "Tidak Ditemukan",
    defaultMessage: "Data atau halaman yang Anda cari tidak ditemukan.",
    meaning: "Halaman, file, atau data ID yang diminta tidak ada di sistem.",
  },
  429: {
    code: 429,
    title: "Permintaan Terlalu Sering",
    defaultMessage: "Permintaan terlalu sering. Harap tunggu beberapa saat sebelum mencoba kembali.",
    meaning: "Pencegahan spam atau rate limiting saat tombol ditekan berkali-kali dalam sedetik.",
  },
  500: {
    code: 500,
    title: "Server Bermasalah",
    defaultMessage: "Terjadi gangguan pada server atau sistem kami. Tim kami sedang menanganinya.",
    meaning: "Gangguan tak terduga pada server aplikasi atau database Supabase.",
  },
};
