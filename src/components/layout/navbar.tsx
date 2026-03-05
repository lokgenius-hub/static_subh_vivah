"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, User, Search, LogOut, LayoutDashboard,
  ChevronDown, Loader2, Heart, MapPin, Camera,
  Star, BookOpen, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { clearSupabaseSession } from "@/lib/auth-helpers";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/destination-weddings", label: "Destinations", icon: Star },
  { href: "/packages", label: "Packages", icon: Heart },
  { href: "/stories", label: "Real Weddings", icon: Camera },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About", icon: Phone },
];

function getDashboardHref(role?: string) {
  if (role === "vendor") return "/partner/dashboard";
  if (role === "admin" || role === "rm") return "/admin/leads";
  return "/venues";
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role);
      }
    });

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();
        setRole(data?.role);
      } else {
        setRole(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setDropdownOpen(false);
    await clearSupabaseSession();
    setUser(null);
    setRole(undefined);
    window.location.href = "/login";
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  // Use DB role when loaded, fall back to user_metadata.role (available immediately from auth)
  const effectiveRole = role ?? (user?.user_metadata?.role as string | undefined);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top bar — WedMeGood style */}
      <div className="bg-[var(--color-charcoal)] text-white text-xs py-1.5 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-gray-300">Best Wedding Venues in Bhabua, Sasaram &amp; Kaimur District</span>
          <div className="flex items-center gap-4">
            <Link href="/enquiry" className="hover:text-[var(--color-primary-light)] transition-colors">Send Enquiry</Link>
            <Link href="/destination-weddings" className="hover:text-[var(--color-primary-light)] transition-colors">Destination Weddings</Link>
            <span className="text-gray-500">|</span>
            <a href="tel:+918000000000" className="hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1">
              <Phone className="h-3 w-3" /> Call Us
            </a>
          </div>
        </div>
      </div>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none">
                <span className="text-gradient-primary">Vivah</span>
                <span className="text-[var(--color-charcoal)]">Sthal</span>
              </span>
              <span className="text-[9px] text-gray-400 font-medium tracking-wider uppercase">Kaimur &middot; Sasaram &middot; Bhabua</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-primary)]/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link href="/venues" className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[var(--color-primary)]">
              <Search className="h-4 w-4" />
            </Link>

            {user ? (
              /* ── Logged-in user menu ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[var(--color-primary)] bg-white hover:bg-pink-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold uppercase">
                    {displayName[0]}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  {/* Role pill inline — visible at a glance */}
                  {effectiveRole && effectiveRole !== "customer" && (
                    <span className="hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                      {effectiveRole === "vendor" ? "Partner" : effectiveRole}
                    </span>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-lg overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                        {effectiveRole && (
                          <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                            {effectiveRole === "vendor" ? "Partner / Vendor" : effectiveRole}
                          </span>
                        )}
                      </div>

                      {/* Partner Portal — highlighted for vendors */}
                      {(effectiveRole === "vendor" || effectiveRole === "admin") && (
                        <Link
                          href="/partner/venues"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors border-b border-gray-100"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Partner Portal
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                        </Link>
                      )}

                      {/* Admin panel */}
                      {(effectiveRole === "admin" || effectiveRole === "rm") && (
                        <Link
                          href="/admin/leads"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Admin Panel
                        </Link>
                      )}

                      {/* Customer dashboard = browse venues */}
                      {effectiveRole === "customer" && (
                        <Link
                          href="/venues"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Browse Venues
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 disabled:opacity-50"
                      >
                        {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                        {loggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest ── */
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}

            {/* Vendors already registered go straight to their venue manager */}
            <Link href={effectiveRole === "vendor" || effectiveRole === "admin" ? "/partner/venues" : "/partner-register"}>
              <Button size="sm">
                {effectiveRole === "vendor" || effectiveRole === "admin" ? "My Venues" : "List Your Venue"}
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/venues" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <Search className="h-5 w-5" />
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200/50 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-medium text-gray-700">{displayName}</span>
                      {effectiveRole && effectiveRole !== "customer" && (
                        <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                          {effectiveRole === "vendor" ? "Partner" : effectiveRole}
                        </span>
                      )}
                    </div>
                    {(effectiveRole === "vendor" || effectiveRole === "admin") && (
                      <Link href="/partner/venues" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                          <LayoutDashboard className="h-4 w-4" /> Partner Portal
                        </Button>
                      </Link>
                    )}
                    {(effectiveRole === "admin" || effectiveRole === "rm") && (
                      <Link href="/admin/leads" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="h-4 w-4" /> Admin Panel
                        </Button>
                      </Link>
                    )}
                    {effectiveRole === "customer" && (
                      <Link href="/venues" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="h-4 w-4" /> Browse Venues
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50" onClick={handleLogout} disabled={loggingOut}>
                      {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                      {loggingOut ? "Signing out..." : "Sign Out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4" /> Login
                      </Button>
                    </Link>
                    <Link href="/partner-register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">List Your Venue</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
