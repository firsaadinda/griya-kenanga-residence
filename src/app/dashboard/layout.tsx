import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { Navbar } from "@/components/navigation/Navbar";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { SessionKeeper } from "@/components/auth/SessionKeeper";

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
    <div className="min-h-screen relative bg-[#F6F7F9] text-[#26292E] flex flex-col font-sans">
      <SessionKeeper />
      <OrbitalBackground />
      <Navbar userProfile={profile} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
    </div>
  );
}
