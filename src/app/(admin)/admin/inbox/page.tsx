"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Mail, MailOpen, Phone, Calendar, Users, MapPin,
  MessageSquare, Search, Filter, Clock, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getInboxMessages, markInboxRead } from "@/lib/actions";
import type { EnquiryInbox } from "@/lib/types";

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<EnquiryInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<EnquiryInbox | null>(null);

  useEffect(() => {
    getInboxMessages().then((data) => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markInboxRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    });
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.is_read) return false;
    if (filter === "read" && !m.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.customer_name.toLowerCase().includes(q) ||
        m.customer_phone.includes(q) ||
        (m.customer_email?.toLowerCase().includes(q) ?? false) ||
        (m.message?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="h-6 w-6" /> Enquiry Inbox
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-primary)]"
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
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MailOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No messages found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== "all" ? "Try changing the filter" : "Enquiries will appear here automatically"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setSelected(selected?.id === msg.id ? null : msg);
                if (!msg.is_read) handleMarkRead(msg.id);
              }}
              className={`bg-gray-800/50 rounded-xl p-4 border cursor-pointer transition-all hover:bg-gray-800 ${
                !msg.is_read ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5" : "border-gray-700/50"
              } ${selected?.id === msg.id ? "ring-2 ring-[var(--color-primary)]" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                    !msg.is_read ? "bg-gradient-gold" : "bg-gray-600"
                  }`}>
                    {msg.customer_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white truncate">{msg.customer_name}</p>
                      {!msg.is_read && (
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                      )}
                    </div>
                    {/* Venue Name */}
                    {(msg as EnquiryInbox & { venue?: { name: string } }).venue?.name ? (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-primary)] font-medium">
                        <Building2 className="h-3 w-3" />
                        <span>{(msg as EnquiryInbox & { venue?: { name: string } }).venue!.name}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-0.5 italic">General Enquiry</div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {msg.customer_phone}
                      </span>
                      {msg.customer_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {msg.customer_email}
                        </span>
                      )}
                      {msg.event_date && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(msg.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      )}
                      {msg.guest_count && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Users className="h-3 w-3" /> {msg.guest_count} guests
                        </span>
                      )}
                    </div>
                    {msg.message && (
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2">{msg.message}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {selected?.id === msg.id && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {msg.event_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(msg.event_date).toLocaleDateString("en-IN")}</span>
                    </div>
                  )}
                  {msg.guest_count && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="h-3.5 w-3.5" />
                      <span>{msg.guest_count} guests</span>
                    </div>
                  )}
                  {msg.budget_range && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>₹ {msg.budget_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{msg.source}</span>
                  </div>
                  <div className="col-span-full flex gap-2 mt-2">
                    <a href={`tel:${msg.customer_phone}`}>
                      <Button size="sm" className="h-8">
                        <Phone className="h-3 w-3" /> Call
                      </Button>
                    </a>
                    <a href={`https://wa.me/${msg.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-8 border-green-600 text-green-400 hover:bg-green-600/10">
                        <MessageSquare className="h-3 w-3" /> WhatsApp
                      </Button>
                    </a>
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
