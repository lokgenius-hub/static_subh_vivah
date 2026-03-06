"use client";

import { motion } from "framer-motion";
import { Clock, Mail, LogOut, CheckCircle } from "lucide-react";
import Link from "next/link";
import { clearSupabaseSession } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await clearSupabaseSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient-gold">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200 mb-6">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mb-3">
            Account Pending Approval
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your account has been created successfully! Our super-admin is
            reviewing your registration. You will be able to access your
            dashboard once your account is approved.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Account Created</p>
                <p className="text-xs text-gray-500">Your details have been submitted</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Awaiting Admin Review</p>
                <p className="text-xs text-gray-500">Super-admin will verify your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-400">Access Granted</p>
                <p className="text-xs text-gray-400">Login again after receiving approval</p>
              </div>
            </div>
          </div>

          {/* Contact hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
            <Mail className="h-4 w-4" />
            <span>
              Need help? Contact{" "}
              <a
                href="mailto:admin@vivahsthal.com"
                className="text-[var(--color-primary)] hover:underline"
              >
                admin@vivahsthal.com
              </a>
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
