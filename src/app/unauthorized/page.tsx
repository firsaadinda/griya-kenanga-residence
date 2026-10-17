import { Suspense } from "react";
import { Forbidden403 } from "@/components/feedback/Forbidden403";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";

interface UnauthorizedPageProps {


  searchParams: Promise<{
    required?: string;
    current?: string;
    path?: string;
  }>;
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const params = await searchParams;
  const currentRole = params.current || "penyewa";
  const requiredRoles = params.required ? params.required.split(",") : ["pemilik", "pengelola"];
  const attemptedPath = params.path ? decodeURIComponent(params.path) : "/dashboard";

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#F6F7F9]">
      <OrbitalBackground />
      <Suspense fallback={<div className="text-center text-xs text-[#737A84]">Memuat verifikasi akses...</div>}>
        <Forbidden403
          currentRole={currentRole}
          requiredRoles={requiredRoles}
          attemptedPath={attemptedPath}
        />
      </Suspense>
    </main>
  );
}
