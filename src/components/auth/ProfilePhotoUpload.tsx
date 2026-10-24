"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { UploadCloud, X, RefreshCw } from "lucide-react";

interface ProfilePhotoUploadProps {
  fullName: string;
  onPhotoSelected: (file: File | null) => void;
  onSkip?: () => void;
}

export function ProfilePhotoUpload({
  fullName,
  onPhotoSelected,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inisial nama dihitung secara real-time berdasarkan kata pertama dan kedua
  // Jika kolom nama masih kosong, berikan inisial default "AK"
  const getInitials = (name: string) => {
    if (!name || !name.trim()) return "AK";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(fullName);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi format file: hanya JPG / JPEG / PNG
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Format file tidak didukung! Gunakan gambar berekstensi JPG atau PNG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran: maksimal 2MB (2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const actualMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMsg(`Ukuran foto terlalu besar (${actualMB}MB)! Batas maksimal adalah 2MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Buat Object URL untuk preview real-time
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoSelected(file);
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onPhotoSelected(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Lingkaran Avatar Preview dengan Inisial Real-Time */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-gradient-to-br from-[#26292E] to-[#1C1E22] flex items-center justify-center text-white select-none">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview Foto Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="tracking-wider text-xs font-bold text-[#88BC3C]">
                {initials}
              </span>
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              title="Hapus foto"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow hover:bg-rose-600 transition"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Kontrol Upload Bersih & Minimalis */}
        <div className="flex-1 min-w-0">
          <input
            type="file"
            ref={fileInputRef}
            name="foto_profil"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="foto-profil-input"
          />

          <div className="flex items-center gap-2">
            <label
              htmlFor="foto-profil-input"
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F6F7F9] border border-gray-200 hover:border-[#14341B] text-xs font-semibold text-[#26292E] shadow-xs transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#26292E]" />
              <span>{previewUrl ? "Ganti Foto" : "Pilih Foto"}</span>
            </label>

            {previewUrl ? (
              <span className="text-[11px] text-emerald-600 font-medium truncate">
                Foto terpilih
              </span>
            ) : (
              <span className="text-[11px] text-[#737A84] truncate">
                Opsional (bisa diatur nanti)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pesan Error Validasi File */}
      {errorMsg && (
        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 animate-in fade-in duration-200">
          <span className="font-semibold">Perhatian:</span>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
