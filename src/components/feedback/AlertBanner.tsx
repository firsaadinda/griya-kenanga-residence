"use client";

import React from "react";
import { HTTP_STATUS_CATALOG, HttpStatusCode } from "@/types/api";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  FileQuestion,
  ClockAlert,
  ServerCrash,
  X,
} from "lucide-react";

interface AlertBannerProps {
  statusCode: HttpStatusCode;
  message?: string;
  errors?: Record<string, string[]> | string | null;
  onDismiss?: () => void;
  className?: string;
}

const STATUS_ICONS: Record<HttpStatusCode, React.ElementType> = {
  200: CheckCircle2,
  400: AlertTriangle,
  401: Lock,
  403: ShieldAlert,
  404: FileQuestion,
  429: ClockAlert,
  500: ServerCrash,
};

const STATUS_THEMES: Record<
  HttpStatusCode,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    iconColor: string;
  }
> = {
  200: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-200",
    badge: "bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  400: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-200",
    badge: "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  401: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-300 dark:border-orange-800",
    text: "text-orange-900 dark:text-orange-200",
    badge: "bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  403: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-300 dark:border-rose-800",
    text: "text-rose-900 dark:text-rose-200",
    badge: "bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  404: {
    bg: "bg-slate-50 dark:bg-slate-900/60",
    border: "border-slate-300 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-200",
    badge: "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  429: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-200",
    badge: "bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  500: {
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-300 dark:border-red-800",
    text: "text-red-900 dark:text-red-200",
    badge: "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function AlertBanner({
  statusCode,
  message,
  errors,
  onDismiss,
  className = "",
}: AlertBannerProps) {
  const meta = HTTP_STATUS_CATALOG[statusCode] || HTTP_STATUS_CATALOG[500];
  const Icon = STATUS_ICONS[statusCode] || ServerCrash;
  const theme = STATUS_THEMES[statusCode] || STATUS_THEMES[500];

  const displayMessage = message || meta.defaultMessage;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-all ${theme.bg} ${theme.border} ${theme.text} ${className}`}
    >
      <div className={`mt-0.5 shrink-0 ${theme.iconColor}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold tracking-wide ${theme.badge}`}>
            HTTP {statusCode}
          </span>
          <h4 className="text-sm font-semibold">{meta.title}</h4>
        </div>

        <p className="text-sm leading-relaxed">{displayMessage}</p>

        {errors && typeof errors === "object" && !Array.isArray(errors) && (
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs opacity-90">
            {Object.entries(errors).map(([field, fieldErrors]) => (
              <li key={field}>
                <span className="font-medium capitalize">{field}:</span>{" "}
                {Array.isArray(fieldErrors) ? fieldErrors.join(", ") : String(fieldErrors)}
              </li>
            ))}
          </ul>
        )}

        {errors && typeof errors === "string" && (
          <p className="mt-1 text-xs opacity-90">{errors}</p>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-current opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
