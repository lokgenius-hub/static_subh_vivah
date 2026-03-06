"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInboxMessages, markInboxRead } from "@/lib/client-actions";
import type { EnquiryInbox } from "@/lib/types";
import {
  Mail, MailOpen, Phone, Calendar, Users, IndianRupee,
  ChevronDown, ChevronUp, Search, MessageSquare, ExternalLink
} from "lucide-react";

export default function PartnerInboxPage() {
  const [messages, setMessages] = useState<EnquiryInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await getInboxMessages(user.id);
        setMessages(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleExpand = async (id: string, isRead: boolean) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!isRead) {
      await markInboxRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
      );
    }
  };

  const filtered = messages.filter((m) => {
    const matchesFilter =
      filter === "all" ? true : filter === "unread" ? !m.is_read : m.is_read;
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      m.customer_name.toLowerCase().includes(q) ||
      m.customer_phone?.toLowerCase().includes(q) ||
      m.customer_email?.toLowerCase().includes(q) ||
      m.venue?.name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">
          My Enquiries
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Customer enquiries for your venues
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold text-[var(--color-charcoal)]">{messages.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          <p className="text-xs text-gray-500">Unread</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 text-center">
          <p className="text-2xl font-bold text-green-600">{messages.length - unreadCount}</p>
          <p className="text-xs text-gray-500">Read</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No enquiries found</p>
          <p className="text-xs text-gray-400 mt-1">
            {messages.length === 0 ? "New enquiries will appear here" : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border transition-all ${
                !msg.is_read ? "border-[var(--color-primary)]/30 shadow-sm" : "border-gray-100"
              }`}
            >
              <button
                onClick={() => handleExpand(msg.id, msg.is_read)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className={`p-2 rounded-lg ${!msg.is_read ? "bg-[var(--color-primary)]/10" : "bg-gray-100"}`}>
                  {msg.is_read ? (
                    <MailOpen className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Mail className="h-5 w-5 text-[var(--color-primary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${!msg.is_read ? "text-[var(--color-charcoal)]" : "text-gray-600"}`}>
                      {msg.customer_name}
                    </p>
                    {!msg.is_read && (
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {msg.venue?.name || "General Enquiry"} • {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {expanded === msg.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expanded === msg.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${msg.customer_phone}`} className="text-sm text-[var(--color-primary)] hover:underline">
                          {msg.customer_phone}
                        </a>
                      </div>
                    )}
                    {msg.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${msg.customer_email}`} className="text-sm text-[var(--color-primary)] hover:underline">
                          {msg.customer_email}
                        </a>
                      </div>
                    )}
                    {msg.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(msg.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    {msg.guest_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{msg.guest_count} guests</span>
                      </div>
                    )}
                    {msg.budget_range && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{msg.budget_range}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    {msg.customer_phone && (
                      <>
                        <a
                          href={`tel:${msg.customer_phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <Phone className="h-3 w-3" /> Call
                        </a>
                        <a
                          href={`https://wa.me/91${msg.customer_phone.replace(/\D/g, "").slice(-10)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
