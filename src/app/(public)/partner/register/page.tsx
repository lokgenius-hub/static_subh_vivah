"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old /partner/register → /partner-register
export default function OldPartnerRegister() {
  const router = useRouter();
  useEffect(() => { router.replace("/partner-register"); }, [router]);
  return null;
}
