import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { Navbar } from "@/components/navigation/Navbar";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { SessionKeeper } from "@/components/auth/SessionKeeper";
import { BrowserWindowFrame } from "@/components/landing/BrowserWindowFrame";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?status=401");
  }

  return (
    <div className="min-h-screen relative font-sans select-text antialiased">
      {/* Background Image: Merapi & Tropical Garden with subtle 5% blur matching Landing Page */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <img
          src="/images/griya-kenanga-12k-merapi.jpg?v=3"
          alt="Latar Belakang Eksklusif Griya Kenanga Residence"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle 5% blur and ambient tint */}
        <div
          className="absolute inset-0 bg-black/15"
          style={{ backdropFilter: "blur(0.6px)", WebkitBackdropFilter: "blur(0.6px)" }}
        />
      </div>

      <SessionKeeper />

      {/* Main Container Wrapper: Framed inside luxury BrowserWindowFrame */}
      <div className="relative z-10 w-full min-h-screen py-3 sm:py-6 lg:py-8 px-2 sm:px-5 lg:px-8 flex flex-col items-center">
        <BrowserWindowFrame url="griyakenanga.id/dashboard" isDashboard>
          <div className="relative min-h-[85vh] bg-[#F6F7F9] text-[#26292E] flex flex-col">
            <OrbitalBackground />
            <Navbar userProfile={profile} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              {children}
            </main>
          </div>
        </BrowserWindowFrame>
      </div>
    </div>
  );
}
