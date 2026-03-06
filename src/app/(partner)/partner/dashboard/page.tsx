"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /partner/dashboard → /partner/venues
export default function PartnerDashboard() {
  const router = useRouter();
  useEffect(() => { router.replace("/partner/venues"); }, [router]);
  return null;
}
