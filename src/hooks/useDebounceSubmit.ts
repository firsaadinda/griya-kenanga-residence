"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { HTTP_STATUS_CATALOG } from "@/types/api";

interface UseDebounceSubmitOptions {
  /** Waktu jeda minimum antar-klik dalam milidetik (default: 1500ms) */
  cooldownMs?: number;
  /** Callback jika pengguna menekan tombol terlalu sering (memicu proteksi 429) */
  onRateLimited?: (message: string) => void;
}

export function useDebounceSubmit<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => Promise<TReturn> | TReturn,
  options: UseDebounceSubmitOptions = {}
) {
  const { cooldownMs = 1500, onRateLimited } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const lastSubmitTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | undefined> => {
      const now = Date.now();
      const elapsed = now - lastSubmitTimeRef.current;

      // Deteksi aksi spam klik bertubi-tubi (Proteksi HTTP 429)
      if (isSubmitting || elapsed < cooldownMs) {
        const rateLimitMsg = HTTP_STATUS_CATALOG[429].defaultMessage;
        setWarningMessage(rateLimitMsg);
        if (onRateLimited) {
          onRateLimited(rateLimitMsg);
        }
        return undefined;
      }

      setWarningMessage(null);
      setIsSubmitting(true);
      setIsCoolingDown(true);
      lastSubmitTimeRef.current = now;

      try {
        const result = await action(...args);
        return result;
      } finally {
        setIsSubmitting(false);

        // Pertahankan cooling down selama sisa durasi jeda
        cooldownTimerRef.current = setTimeout(() => {
          setIsCoolingDown(false);
          setWarningMessage(null);
        }, cooldownMs);
      }
    },
    [action, cooldownMs, isSubmitting, onRateLimited]
  );

  return {
    execute,
    isSubmitting,
    isCoolingDown,
    isDisabled: isSubmitting || isCoolingDown,
    warningMessage,
  };
}
