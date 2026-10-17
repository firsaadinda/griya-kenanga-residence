export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          aksi: string
          data_id: string
          dibuat_pada: string
          id: number
          pelaku_id: string | null
          peran: Database["public"]["Enums"]["peran_pengguna"] | null
          sebelum: Json | null
          sesudah: Json | null
          tabel: string
        }
        Insert: {
          aksi: string
          data_id: string
          dibuat_pada?: string
          id?: never
          pelaku_id?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"] | null
          sebelum?: Json | null
          sesudah?: Json | null
          tabel: string
        }
        Update: {
          aksi?: string
          data_id?: string
          dibuat_pada?: string
          id?: never
          pelaku_id?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"] | null
          sebelum?: Json | null
          sesudah?: Json | null
          tabel?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_pelaku_id_fkey"
            columns: ["pelaku_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_pelaku_id_fkey"
            columns: ["pelaku_id"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
        ]
      }
      identitas_penyewa: {
        Row: {
          alamat_asal: string
          alasan_tolak: string | null
          diperbarui_pada: string
          diverifikasi_oleh: string | null
          diverifikasi_pada: string | null
          foto_ktp_path: string
          kontak_darurat_hp: string
          kontak_darurat_nama: string
          nik: string
          penyewa_id: string
          status_verifikasi: Database["public"]["Enums"]["verifikasi_status"]
        }
        Insert: {
          alamat_asal: string
          alasan_tolak?: string | null
          diperbarui_pada?: string
          diverifikasi_oleh?: string | null
          diverifikasi_pada?: string | null
          foto_ktp_path: string
          kontak_darurat_hp: string
          kontak_darurat_nama: string
          nik: string
          penyewa_id: string
          status_verifikasi?: Database["public"]["Enums"]["verifikasi_status"]
        }
        Update: {
          alamat_asal?: string
          alasan_tolak?: string | null
          diperbarui_pada?: string
          diverifikasi_oleh?: string | null
          diverifikasi_pada?: string | null
          foto_ktp_path?: string
          kontak_darurat_hp?: string
          kontak_darurat_nama?: string
          nik?: string
          penyewa_id?: string
          status_verifikasi?: Database["public"]["Enums"]["verifikasi_status"]
        }
        Relationships: [
          {
            foreignKeyName: "identitas_penyewa_diverifikasi_oleh_fkey"
            columns: ["diverifikasi_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identitas_penyewa_diverifikasi_oleh_fkey"
            columns: ["diverifikasi_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "identitas_penyewa_penyewa_id_fkey"
            columns: ["penyewa_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identitas_penyewa_penyewa_id_fkey"
            columns: ["penyewa_id"]
            isOneToOne: true
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
        ]
      }
      kontrak: {
        Row: {
          alasan_berakhir: string | null
          diaktifkan_pada: string | null
          dibuat_oleh: string | null
          dibuat_pada: string
          durasi_bulan: number
          harga_sewa_bulanan: number
          id: string
          nomor: string
          penyewa_id: string
          status: Database["public"]["Enums"]["kontrak_status"]
          tanggal_berakhir_aktual: string | null
          tanggal_mulai: string
          tanggal_selesai: string
          unit_id: string
        }
        Insert: {
          alasan_berakhir?: string | null
          diaktifkan_pada?: string | null
          dibuat_oleh?: string | null
          dibuat_pada?: string
          durasi_bulan: number
          harga_sewa_bulanan: number
          id?: string
          nomor: string
          penyewa_id: string
          status?: Database["public"]["Enums"]["kontrak_status"]
          tanggal_berakhir_aktual?: string | null
          tanggal_mulai: string
          tanggal_selesai: string
          unit_id: string
        }
        Update: {
          alasan_berakhir?: string | null
          diaktifkan_pada?: string | null
          dibuat_oleh?: string | null
          dibuat_pada?: string
          durasi_bulan?: number
          harga_sewa_bulanan?: number
          id?: string
          nomor?: string
          penyewa_id?: string
          status?: Database["public"]["Enums"]["kontrak_status"]
          tanggal_berakhir_aktual?: string | null
          tanggal_mulai?: string
          tanggal_selesai?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kontrak_dibuat_oleh_fkey"
            columns: ["dibuat_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kontrak_dibuat_oleh_fkey"
            columns: ["dibuat_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "kontrak_penyewa_id_fkey"
            columns: ["penyewa_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kontrak_penyewa_id_fkey"
            columns: ["penyewa_id"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "kontrak_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "unit"
            referencedColumns: ["id"]
          },
        ]
      }
      laporan_kerusakan: {
        Row: {
          alasan_tolak: string | null
          biaya_aktual: number | null
          catatan: string | null
          deskripsi: string
          dibuat_pada: string
          diperbarui_pada: string
          disetujui_oleh: string | null
          disetujui_pada: string | null
          ditutup_pada: string | null
          estimasi_biaya: number | null
          foto_paths: string[]
          id: string
          judul: string
          kategori: Database["public"]["Enums"]["kerusakan_kategori"]
          kontrak_id: string
          nomor: string
          pelapor_id: string
          selesai_pada: string | null
          status: Database["public"]["Enums"]["kerusakan_status"]
          unit_id: string
        }
        Insert: {
          alasan_tolak?: string | null
          biaya_aktual?: number | null
          catatan?: string | null
          deskripsi: string
          dibuat_pada?: string
          diperbarui_pada?: string
          disetujui_oleh?: string | null
          disetujui_pada?: string | null
          ditutup_pada?: string | null
          estimasi_biaya?: number | null
          foto_paths: string[]
          id?: string
          judul: string
          kategori: Database["public"]["Enums"]["kerusakan_kategori"]
          kontrak_id: string
          nomor: string
          pelapor_id: string
          selesai_pada?: string | null
          status?: Database["public"]["Enums"]["kerusakan_status"]
          unit_id: string
        }
        Update: {
          alasan_tolak?: string | null
          biaya_aktual?: number | null
          catatan?: string | null
          deskripsi?: string
          dibuat_pada?: string
          diperbarui_pada?: string
          disetujui_oleh?: string | null
          disetujui_pada?: string | null
          ditutup_pada?: string | null
          estimasi_biaya?: number | null
          foto_paths?: string[]
          id?: string
          judul?: string
          kategori?: Database["public"]["Enums"]["kerusakan_kategori"]
          kontrak_id?: string
          nomor?: string
          pelapor_id?: string
          selesai_pada?: string | null
          status?: Database["public"]["Enums"]["kerusakan_status"]
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laporan_kerusakan_disetujui_oleh_fkey"
            columns: ["disetujui_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_kerusakan_disetujui_oleh_fkey"
            columns: ["disetujui_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "laporan_kerusakan_kontrak_id_fkey"
            columns: ["kontrak_id"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_kerusakan_pelapor_id_fkey"
            columns: ["pelapor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_kerusakan_pelapor_id_fkey"
            columns: ["pelapor_id"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "laporan_kerusakan_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "unit"
            referencedColumns: ["id"]
          },
        ]
      }
      nomor_urut: {
        Row: {
          jenis: string
          periode: string
          terakhir: number
        }
        Insert: {
          jenis: string
          periode: string
          terakhir?: number
        }
        Update: {
          jenis?: string
          periode?: string
          terakhir?: number
        }
        Relationships: []
      }
      pembayaran: {
        Row: {
          alasan_batal: string | null
          bukti_path: string | null
          dibatalkan_oleh: string | null
          dibatalkan_pada: string | null
          dibuat_pada: string
          dicatat_oleh: string | null
          id: string
          jumlah: number
          metode: Database["public"]["Enums"]["pembayaran_metode"]
          referensi_mayar: string | null
          status: Database["public"]["Enums"]["pembayaran_status"]
          tagihan_id: string
          tanggal_bayar: string
        }
        Insert: {
          alasan_batal?: string | null
          bukti_path?: string | null
          dibatalkan_oleh?: string | null
          dibatalkan_pada?: string | null
          dibuat_pada?: string
          dicatat_oleh?: string | null
          id?: string
          jumlah: number
          metode: Database["public"]["Enums"]["pembayaran_metode"]
          referensi_mayar?: string | null
          status?: Database["public"]["Enums"]["pembayaran_status"]
          tagihan_id: string
          tanggal_bayar?: string
        }
        Update: {
          alasan_batal?: string | null
          bukti_path?: string | null
          dibatalkan_oleh?: string | null
          dibatalkan_pada?: string | null
          dibuat_pada?: string
          dicatat_oleh?: string | null
          id?: string
          jumlah?: number
          metode?: Database["public"]["Enums"]["pembayaran_metode"]
          referensi_mayar?: string | null
          status?: Database["public"]["Enums"]["pembayaran_status"]
          tagihan_id?: string
          tanggal_bayar?: string
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_dibatalkan_oleh_fkey"
            columns: ["dibatalkan_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayaran_dibatalkan_oleh_fkey"
            columns: ["dibatalkan_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "pembayaran_dicatat_oleh_fkey"
            columns: ["dicatat_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayaran_dicatat_oleh_fkey"
            columns: ["dicatat_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "pembayaran_tagihan_id_fkey"
            columns: ["tagihan_id"]
            isOneToOne: false
            referencedRelation: "tagihan"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aktif: boolean
          dibuat_pada: string
          email: string
          id: string
          nama_lengkap: string
          no_hp: string | null
          peran: Database["public"]["Enums"]["peran_pengguna"]
        }
        Insert: {
          aktif?: boolean
          dibuat_pada?: string
          email: string
          id: string
          nama_lengkap: string
          no_hp?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"]
        }
        Update: {
          aktif?: boolean
          dibuat_pada?: string
          email?: string
          id?: string
          nama_lengkap?: string
          no_hp?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"]
        }
        Relationships: []
      }
      tagihan: {
        Row: {
          alasan_batal: string | null
          denda: number
          dibuat_oleh: string | null
          dibuat_pada: string
          id: string
          jatuh_tempo: string
          kontrak_id: string
          mayar_invoice_id: string | null
          mayar_link: string | null
          nominal_sewa: number
          nomor: string
          periode: string
          status: Database["public"]["Enums"]["tagihan_status"]
          terbayar: number
        }
        Insert: {
          alasan_batal?: string | null
          denda?: number
          dibuat_oleh?: string | null
          dibuat_pada?: string
          id?: string
          jatuh_tempo: string
          kontrak_id: string
          mayar_invoice_id?: string | null
          mayar_link?: string | null
          nominal_sewa: number
          nomor: string
          periode: string
          status?: Database["public"]["Enums"]["tagihan_status"]
          terbayar?: number
        }
        Update: {
          alasan_batal?: string | null
          denda?: number
          dibuat_oleh?: string | null
          dibuat_pada?: string
          id?: string
          jatuh_tempo?: string
          kontrak_id?: string
          mayar_invoice_id?: string | null
          mayar_link?: string | null
          nominal_sewa?: number
          nomor?: string
          periode?: string
          status?: Database["public"]["Enums"]["tagihan_status"]
          terbayar?: number
        }
        Relationships: [
          {
            foreignKeyName: "tagihan_dibuat_oleh_fkey"
            columns: ["dibuat_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tagihan_dibuat_oleh_fkey"
            columns: ["dibuat_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
          {
            foreignKeyName: "tagihan_kontrak_id_fkey"
            columns: ["kontrak_id"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id"]
          },
        ]
      }
      unit: {
        Row: {
          dibuat_pada: string
          harga_sewa_bulanan: number
          id: string
          keterangan: string | null
          kode: string
          lantai: number
          luas_m2: number
          status: Database["public"]["Enums"]["unit_status"]
          tipe: Database["public"]["Enums"]["unit_tipe"]
        }
        Insert: {
          dibuat_pada?: string
          harga_sewa_bulanan: number
          id?: string
          keterangan?: string | null
          kode: string
          lantai: number
          luas_m2: number
          status?: Database["public"]["Enums"]["unit_status"]
          tipe: Database["public"]["Enums"]["unit_tipe"]
        }
        Update: {
          dibuat_pada?: string
          harga_sewa_bulanan?: number
          id?: string
          keterangan?: string | null
          kode?: string
          lantai?: number
          luas_m2?: number
          status?: Database["public"]["Enums"]["unit_status"]
          tipe?: Database["public"]["Enums"]["unit_tipe"]
        }
        Relationships: []
      }
    }
    Views: {
      v_identitas_penyewa_pemilik: {
        Row: {
          alasan_tolak: string | null
          diperbarui_pada: string | null
          diverifikasi_oleh: string | null
          diverifikasi_pada: string | null
          email: string | null
          nama_lengkap: string | null
          nik_tersamar: string | null
          no_hp: string | null
          penyewa_id: string | null
          status_verifikasi:
            | Database["public"]["Enums"]["verifikasi_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "identitas_penyewa_diverifikasi_oleh_fkey"
            columns: ["diverifikasi_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identitas_penyewa_diverifikasi_oleh_fkey"
            columns: ["diverifikasi_oleh"]
            isOneToOne: false
            referencedRelation: "v_identitas_penyewa_pemilik"
            referencedColumns: ["penyewa_id"]
          },
        ]
      }
    }
    Functions: {
      catat_audit_log: {
        Args: {
          p_aksi: string
          p_data_id: string
          p_sebelum?: Json
          p_sesudah?: Json
          p_tabel: string
        }
        Returns: undefined
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["peran_pengguna"]
      }
    }
    Enums: {
      kerusakan_kategori:
        | "listrik"
        | "air"
        | "ac"
        | "bangunan"
        | "perabot"
        | "lainnya"
      kerusakan_status:
        | "dilaporkan"
        | "diproses"
        | "menunggu_persetujuan"
        | "selesai"
        | "ditutup"
        | "ditolak"
      kontrak_status: "draf" | "aktif" | "selesai" | "diakhiri" | "dibatalkan"
      pembayaran_metode: "tunai" | "transfer" | "mayar"
      pembayaran_status: "sah" | "dibatalkan"
      peran_pengguna: "penyewa" | "pengelola" | "pemilik"
      tagihan_status: "belum_bayar" | "sebagian" | "lunas" | "dibatalkan"
      unit_status: "tersedia" | "perbaikan" | "nonaktif"
      unit_tipe: "standar" | "ac" | "studio"
      verifikasi_status: "belum" | "terverifikasi" | "ditolak"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      kerusakan_kategori: [
        "listrik",
        "air",
        "ac",
        "bangunan",
        "perabot",
        "lainnya",
      ],
      kerusakan_status: [
        "dilaporkan",
        "diproses",
        "menunggu_persetujuan",
        "selesai",
        "ditutup",
        "ditolak",
      ],
      kontrak_status: ["draf", "aktif", "selesai", "diakhiri", "dibatalkan"],
      pembayaran_metode: ["tunai", "transfer", "mayar"],
      pembayaran_status: ["sah", "dibatalkan"],
      peran_pengguna: ["penyewa", "pengelola", "pemilik"],
      tagihan_status: ["belum_bayar", "sebagian", "lunas", "dibatalkan"],
      unit_status: ["tersedia", "perbaikan", "nonaktif"],
      unit_tipe: ["standar", "ac", "studio"],
      verifikasi_status: ["belum", "terverifikasi", "ditolak"],
    },
  },
} as const
