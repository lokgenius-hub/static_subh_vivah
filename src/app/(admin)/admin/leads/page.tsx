"use client";

import { useEffect, useState } from "react";
import { getLeads } from "@/lib/client-actions";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_COLORS } from "@/lib/constants";
import { Phone, Mail, Calendar, Users, Building2 } from "lucide-react";
import { format } from "date-fns";
import { LeadActions } from "./lead-actions";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then((l) => { setLeads(l as Record<string, unknown>[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }

  const displayLeads = leads.length > 0 ? leads : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Lead Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all incoming leads from customers. Assign RMs and track conversions.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", count: displayLeads.length, color: "bg-gray-100 text-gray-800" },
          { label: "New", count: displayLeads.filter((l) => l.status === "new").length, color: "bg-blue-100 text-blue-800" },
          { label: "Contacted", count: displayLeads.filter((l) => l.status === "contacted").length, color: "bg-yellow-100 text-yellow-800" },
          { label: "Qualified", count: displayLeads.filter((l) => l.status === "qualified").length, color: "bg-purple-100 text-purple-800" },
          { label: "Converted", count: displayLeads.filter((l) => l.status === "converted").length, color: "bg-green-100 text-green-800" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold">{s.count}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs ${s.color}`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-medium text-sm">{lead.customer_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Phone className="h-3 w-3" /> {lead.customer_phone}
                    </div>
                    {lead.customer_email && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Mail className="h-3 w-3" /> {lead.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {(lead.venue as any)?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1 text-xs">
                      {lead.event_date && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lead.event_date), "MMM d, yyyy")}
                        </div>
                      )}
                      {lead.guest_count && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Users className="h-3 w-3" /> {lead.guest_count} guests
                        </div>
                      )}
                      {lead.slot_preference && (
                        <span className="text-gray-400 capitalize">{lead.slot_preference}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={lead.source === "ai_chatbot" ? "gold" : "default"}>
                      {lead.source.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        LEAD_STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <LeadActions leadId={lead.id} currentStatus={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
