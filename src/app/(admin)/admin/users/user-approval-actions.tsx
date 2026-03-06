"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { adminApproveUser, adminRejectUser } from "@/lib/client-actions";

export function ApprovalActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  if (done === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
        <CheckCircle className="h-3.5 w-3.5" /> Approved
      </span>
    );
  }
  if (done === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
        <XCircle className="h-3.5 w-3.5" /> Rejected
      </span>
    );
  }

  const handleApprove = async () => {
    setLoading("approve");
    const result = await adminApproveUser(userId);
    if (result.success) {
      setDone("approved");
    }
    setLoading(null);
  };

  const handleReject = async () => {
    if (!confirm("Reject this user? They will NOT be able to access the platform.")) return;
    setLoading("reject");
    const result = await adminRejectUser(userId);
    if (result.success) {
      setDone("rejected");
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle className="h-3.5 w-3.5" />
        )}
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        Reject
      </button>
    </div>
  );
}
