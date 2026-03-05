"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Building2, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { upgradeToVendor, sendRegistrationOtp, verifyRegistrationOtp } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";

type Step = "details" | "otp" | "success";

export default function PartnerRegisterPage() {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formValues, setFormValues] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    password: "",
  });

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setLoggedInEmail(user.email ?? null);
        setLoggedInRole((user.user_metadata?.role as string) ?? "customer");
      }
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    const result = await upgradeToVendor();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = "/partner/venues";
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const values = {
      full_name: fd.get("full_name") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      city: fd.get("city") as string,
      password: fd.get("password") as string,
    };

    if (values.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    setFormValues(values);

    const result = await sendRegistrationOtp(values.email, values.full_name, values.phone, "vendor");
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to send OTP. Please try again.");
      return;
    }

    if (result.fallbackOtp) {
      setFallbackOtp(result.fallbackOtp);
    } else {
      setFallbackOtp(null);
    }

    setStep("otp");
    setResendCooldown(60);
    setOtpValues(["", "", "", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpValues];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpValues(newOtp);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    otpRefs.current[nextEmpty]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyRegistrationOtp(formValues.email, otp, formValues.password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Verification failed. Please try again.");
      return;
    }

    if (result.needsConfirmation) {
      setStep("success");
      setInfo("Registration successful! Your account has been created.");
    } else {
      window.location.href = "/partner/venues";
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");

    const result = await sendRegistrationOtp(formValues.email, formValues.full_name, formValues.phone, "vendor");
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to resend OTP.");
      return;
    }

    if (result.fallbackOtp) {
      setFallbackOtp(result.fallbackOtp);
    }

    setResendCooldown(60);
    setOtpValues(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
    setInfo(result.fallbackOtp ? "New OTP generated!" : "New OTP sent to your email!");
    setTimeout(() => setInfo(""), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient-primary">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-3">
              {step === "otp" ? (
                <ShieldCheck className="h-7 w-7 text-[var(--color-primary)]" />
              ) : (
                <Building2 className="h-7 w-7 text-[var(--color-primary)]" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">
              {step === "otp" ? "Verify Your Email" : "Partner Registration"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === "otp"
                ? fallbackOtp
                  ? "Enter the verification code shown below"
                  : `Enter the 6-digit code sent to ${formValues.email}`
                : "List your venue on India's premium wedding marketplace"}
            </p>
          </div>

          {/* Step indicator */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`h-2 w-8 rounded-full transition-colors ${step === "details" ? "bg-[var(--color-primary)]" : "bg-[var(--color-primary)]/30"}`} />
              <div className={`h-2 w-8 rounded-full transition-colors ${step === "otp" ? "bg-[var(--color-primary)]" : "bg-gray-200"}`} />
            </div>
          )}

          {/* Already logged in as customer */}
          {!checkingAuth && loggedInEmail && loggedInRole !== "vendor" && loggedInRole !== "admin" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-medium mb-1">
                You&apos;re signed in as <span className="font-bold">{loggedInEmail}</span>
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Upgrade your existing account to a Vendor account — no new registration needed.
              </p>
              {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
              <Button onClick={handleUpgrade} loading={loading} className="w-full">
                <ArrowRight className="h-4 w-4" />
                Become a Partner Now
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Or{" "}
                <button
                  className="text-[var(--color-primary)] underline"
                  onClick={() => setLoggedInEmail(null)}
                >
                  register with a different account
                </button>
              </p>
            </div>
          )}

          {/* Already a vendor */}
          {!checkingAuth && loggedInEmail && (loggedInRole === "vendor" || loggedInRole === "admin") && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-sm text-green-800 font-medium mb-3">
                You&apos;re already registered as a partner!
              </p>
              <Link href="/partner/venues">
                <Button className="w-full">
                  <ArrowRight className="h-4 w-4" />
                  Go to My Venues
                </Button>
              </Link>
            </div>
          )}

          {/* Show form only if not logged in */}
          {(checkingAuth || !loggedInEmail) && (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {info && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {info}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Details */}
                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <Input
                        name="full_name"
                        label="Your Name"
                        placeholder="Full name"
                        icon={<User className="h-4 w-4" />}
                        defaultValue={formValues.full_name}
                        required
                      />
                      <Input
                        name="phone"
                        type="tel"
                        label="Phone Number"
                        placeholder="+91 XXXXX XXXXX"
                        icon={<Phone className="h-4 w-4" />}
                        defaultValue={formValues.phone}
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        label="Business Email"
                        placeholder="you@business.com"
                        icon={<Mail className="h-4 w-4" />}
                        defaultValue={formValues.email}
                        required
                      />
                      <Select
                        name="city"
                        label="City"
                        options={CITIES.map((c) => ({ value: c, label: c }))}
                        placeholder="Select your city"
                        defaultValue={formValues.city}
                      />
                      <Input
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Minimum 6 characters"
                        icon={<Lock className="h-4 w-4" />}
                        defaultValue={formValues.password}
                        required
                        minLength={6}
                      />

                      <Button type="submit" className="w-full" loading={loading}>
                        <Mail className="h-4 w-4" />
                        Send OTP to Email
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* Step 2: OTP Verification */}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {fallbackOtp && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                        <p className="text-xs text-amber-700 mb-2">
                          Email delivery not available yet. Use this code:
                        </p>
                        <p className="text-3xl font-bold tracking-[8px] text-amber-900">{fallbackOtp}</p>
                        <p className="text-[11px] text-amber-600 mt-2">
                          Add a verified domain on <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-medium">resend.com/domains</a> to enable email delivery
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                      {otpValues.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full"
                      loading={loading}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify & Register
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        onClick={() => { setStep("details"); setError(""); }}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Back
                      </button>

                      <button
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="flex items-center gap-1 text-[var(--color-primary)] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Complete!</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Your partner account has been created successfully. Sign in to start listing your venues.
                    </p>
                    <Link href="/login">
                      <Button className="w-full">
                        <ArrowRight className="h-4 w-4" />
                        Sign In Now
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already a partner?{" "}
            <Link
              href="/login"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-2 text-center text-sm text-gray-400">
            Looking to book a venue?{" "}
            <Link
              href="/register"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Customer Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
