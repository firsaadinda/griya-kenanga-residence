/**
 * Spesifikasi Keamanan Kata Sandi Griya Kenanga Residence:
 * - Panjang wajib 12 hingga 16 karakter
 * - Kombinasi huruf besar (uppercase: A-Z)
 * - Kombinasi huruf kecil (lowercase: a-z)
 * - Angka (digit: 0-9)
 * - Simbol atau tanda baca khusus (!@#$%^&*()_+-=[]{};':"|,.<>/?`~)
 */

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  score: number; // 0 - 5
  strengthLabel: "Sangat Lemah" | "Lemah" | "Cukup" | "Kuat" | "Sangat Kuat";
  strengthColor: string;
}

export function evaluatePasswordStrength(password: string): PasswordValidationResult {
  const p = password || "";

  const hasLength = p.length >= 12 && p.length <= 16;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /\d/.test(p);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p);

  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12 && p.length <= 16) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;

  let strengthLabel: PasswordValidationResult["strengthLabel"] = "Sangat Lemah";
  let strengthColor = "bg-rose-500";

  if (p.length === 0) {
    score = 0;
    strengthLabel = "Sangat Lemah";
    strengthColor = "bg-slate-200";
  } else if (score <= 1) {
    strengthLabel = "Sangat Lemah";
    strengthColor = "bg-rose-500";
  } else if (score === 2) {
    strengthLabel = "Lemah";
    strengthColor = "bg-amber-500";
  } else if (score === 3) {
    strengthLabel = "Cukup";
    strengthColor = "bg-yellow-500";
  } else if (score === 4) {
    strengthLabel = "Kuat";
    strengthColor = "bg-emerald-500";
  } else {
    strengthLabel = "Sangat Kuat";
    strengthColor = "bg-emerald-600";
  }

  const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

  let message: string | undefined = undefined;
  if (!hasLength) {
    if (p.length < 12) {
      message = `Kata sandi minimal 12 karakter (saat ini ${p.length} karakter).`;
    } else {
      message = `Kata sandi maksimal 16 karakter (saat ini ${p.length} karakter).`;
    }
  } else if (!hasUpper) {
    message = "Kata sandi wajib mengandung setidaknya 1 huruf kapital (A-Z).";
  } else if (!hasLower) {
    message = "Kata sandi wajib mengandung setidaknya 1 huruf kecil (a-z).";
  } else if (!hasNumber) {
    message = "Kata sandi wajib mengandung setidaknya 1 angka (0-9).";
  } else if (!hasSymbol) {
    message = "Kata sandi wajib mengandung setidaknya 1 simbol atau tanda baca.";
  }

  return {
    isValid,
    message,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    score,
    strengthLabel,
    strengthColor,
  };
}

export function validateStrongPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  const result = evaluatePasswordStrength(password);
  return {
    isValid: result.isValid,
    message: result.message,
  };
}
