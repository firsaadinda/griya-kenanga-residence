/**
 * Regex & Validator Keamanan Kata Sandi Kuat:
 * - Minimal 8 karakter
 * - Minimal 1 huruf besar (uppercase: A-Z)
 * - Minimal 1 huruf kecil (lowercase: a-z)
 * - Minimal 1 angka (digit: 0-9)
 * - Minimal 1 simbol / karakter khusus (!@#$%^&* dll)
 */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export function validateStrongPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Kata sandi minimal terdiri dari 8 karakter.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Kata sandi wajib mengandung setidaknya 1 huruf besar (A-Z).",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Kata sandi wajib mengandung setidaknya 1 huruf kecil (a-z).",
    };
  }
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Kata sandi wajib mengandung setidaknya 1 angka (0-9).",
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message:
        "Kata sandi wajib mengandung setidaknya 1 simbol khusus (!@#$%^&* dll).",
    };
  }
  return { isValid: true };
}
