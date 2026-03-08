"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Calendar, Settings, Home, Mail } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { MobilePartnerNav } from "@/components/layout/mobile-partner-nav";
import { useAuth } from "@/hooks/use-auth";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login?redirect=/partner/dashboard"); return; }
    const effectiveRole = profile?.role ?? (user.user_metadata?.role as string | undefined);
    if (effectiveRole !== "vendor" && effectiveRole !== "admin") router.push("/venues");
  }, [user, profile, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }

  if (!user) return null;

  // Show pending approval screen for vendors awaiting admin verification
  const approvedStatus = (profile as Record<string, unknown> | null)?.approved_status as string | undefined;
  const effectiveRole = profile?.role ?? (user.user_metadata?.role as string | undefined);
  if (effectiveRole === "vendor" && approvedStatus && approvedStatus !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-2">
            Account Pending Approval
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Your partner account is under review. Our admin team will approve you within 24 hours.
          </p>
          <p className="text-amber-700 text-sm font-medium bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
            📞 Need faster approval? Call us at{" "}
            <a href="tel:7303584266" className="underline font-bold">7303584266</a>
          </p>
          <SignOutButton className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors" />
        </div>
      </div>
    );
  }

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Partner";
  const displayEmail = profile?.email ?? user.email ?? "";

  const navItems = [
    { href: "/partner/venues", icon: Building2, label: "My Venues" },
    { href: "/partner/inbox", icon: Mail, label: "Enquiry Inbox" },
    { href: "/partner/calendar", icon: Calendar, label: "Availability" },
    { href: "/partner/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Brand + role badge */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold">
              <span className="text-gradient-gold">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Partner Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)] transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-white text-sm font-bold uppercase">
              {displayName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="h-3 w-3" /> Public site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-sm">
              <span className="text-gradient-gold">Vivah</span>Sthal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full">
              Partner Portal
            </span>
            <MobilePartnerNav />
          </div>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

