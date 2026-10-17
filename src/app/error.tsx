"use client";

import { useEffect } from "react";
import { ServerCrash, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { HTTP_STATUS_CATALOG } from "@/types/api";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const meta = HTTP_STATUS_CATALOG[500];

  useEffect(() => {
    // Logging error yang aman
    console.error("Next.js Error Boundary menangkap kesalahan:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-red-50/30 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-950/60 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
          <ServerCrash className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="mt-4 inline-block rounded-full bg-red-100 dark:bg-red-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
          Status Code 500
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {meta.title}
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {meta.defaultMessage}
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-3 text-left font-mono text-xs text-red-600 dark:text-red-400 overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
