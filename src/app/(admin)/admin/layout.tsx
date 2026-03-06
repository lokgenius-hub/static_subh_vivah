"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, Settings, Shield, BookOpen, Home, Mail, Package } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login?redirect=/admin/leads"); return; }
    const effectiveRole = profile?.role ?? (user.user_metadata?.role as string | undefined);
    if (effectiveRole && !["admin", "rm"].includes(effectiveRole)) router.push("/");
  }, [user, profile, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }

  if (!user) return null;

  const effectiveRole = profile?.role ?? (user.user_metadata?.role as string | undefined);
  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Admin";
  const displayRole = effectiveRole?.toUpperCase() ?? "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[var(--color-charcoal)] flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold text-white">
              <span className="text-gradient-gold">Admin</span> Portal
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin/leads", icon: Phone, label: "Leads" },
            { href: "/admin/inbox", icon: Mail, label: "Enquiry Inbox" },
            { href: "/admin/venues", icon: LayoutDashboard, label: "All Venues" },
            { href: "/admin/packages", icon: Package, label: "Packages" },
            { href: "/admin/users", icon: Users, label: "Users" },
            { href: "/admin/blog", icon: BookOpen, label: "Blog & Ads" },
            { href: "/admin/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-white text-xs font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
              <Home className="h-3 w-3" /> Back to site
            </Link>
            <SignOutButton className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden bg-[var(--color-charcoal)] px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm">Admin Portal</span>
          <SignOutButton className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors" />
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
