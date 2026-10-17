import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { HTTP_STATUS_CATALOG } from "@/types/api";

export default function NotFound() {
  const meta = HTTP_STATUS_CATALOG[404];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <FileQuestion className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="mt-4 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Status Code 404
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {meta.title}
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {meta.defaultMessage}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
