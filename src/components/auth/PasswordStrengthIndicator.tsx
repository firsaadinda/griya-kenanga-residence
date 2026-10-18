"use client";

import { evaluatePasswordStrength } from "@/lib/auth/password";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const result = evaluatePasswordStrength(password);

  if (!password) {
    return null;
  }

  const bars = [1, 2, 3, 4, 5];

  const getBarColor = (index: number) => {
    if (index >= result.score) return "bg-slate-200";
    if (result.score <= 1) return "bg-rose-500";
    if (result.score === 2) return "bg-amber-500";
    if (result.score === 3) return "bg-yellow-500";
    if (result.score === 4) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  const getTextColor = () => {
    if (result.score <= 1) return "text-rose-600";
    if (result.score === 2) return "text-amber-600";
    if (result.score === 3) return "text-yellow-700";
    if (result.score === 4) return "text-emerald-600";
    return "text-emerald-700";
  };

  return (
    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
      {/* Baris Bar Visual Dinamis */}
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-[#737A84]">Kekuatan Sandi:</span>
        <span className={`font-semibold ${getTextColor()}`}>
          {result.strengthLabel}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {bars.map((bar, idx) => (
          <div
            key={bar}
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(
              idx
            )}`}
          />
        ))}
      </div>

      {/* Rincian Kriteria / Syarat Password */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[11px] text-[#737A84]">
          <div className="flex items-center gap-1.5">
            {result.hasLength ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={result.hasLength ? "text-[#26292E] font-medium" : ""}>
              12–16 karakter ({password.length}/16)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {result.hasUpper ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={result.hasUpper ? "text-[#26292E] font-medium" : ""}>
              Huruf kapital (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {result.hasLower ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={result.hasLower ? "text-[#26292E] font-medium" : ""}>
              Huruf kecil (a-z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {result.hasNumber ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={result.hasNumber ? "text-[#26292E] font-medium" : ""}>
              Angka (0-9)
            </span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            {result.hasSymbol ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={result.hasSymbol ? "text-[#26292E] font-medium" : ""}>
              Simbol / tanda baca (!@#$%^&* dll)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
