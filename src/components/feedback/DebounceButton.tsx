"use client";

import React from "react";
import { useDebounceSubmit } from "@/hooks/useDebounceSubmit";
import { Loader2 } from "lucide-react";

interface DebounceButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onClick: () => Promise<unknown> | unknown;
  cooldownMs?: number;
  loadingText?: string;
  onRateLimited?: (message: string) => void;
  children: React.ReactNode;
}

export function DebounceButton({
  onClick,
  cooldownMs = 1500,
  loadingText,
  onRateLimited,
  children,
  className = "",
  disabled,
  ...props
}: DebounceButtonProps) {
  const { execute, isSubmitting, isCoolingDown, isDisabled } = useDebounceSubmit(
    onClick,
    { cooldownMs, onRateLimited }
  );

  return (
    <button
      type="button"
      onClick={() => void execute()}
      disabled={disabled || isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText || "Memproses..."}</span>
        </>
      ) : isCoolingDown ? (
        <>
          <span>{children}</span>
          <span className="text-xs opacity-75">(Tunggu...)</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
