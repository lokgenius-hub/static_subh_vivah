"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isBefore, startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Sun, Moon, Clock, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyVenues, getVenueSlots, updateVenueSlot } from "@/lib/client-actions";
import type { Venue, VenueSlot } from "@/lib/types";

export default function CalendarPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<VenueSlot[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const monthKey = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    (async () => {
      setLoadingVenues(true);
      const { venues: data } = await getMyVenues();
      setVenues(data as Venue[]);
      if (data.length > 0) setSelectedVenueId(data[0].id);
      setLoadingVenues(false);
    })();
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!selectedVenueId) return;
    setLoadingSlots(true);
    const data = await getVenueSlots(selectedVenueId, monthKey);
    setSlots(data);
    setLoadingSlots(false);
  }, [selectedVenueId, monthKey]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const slotsForDay = (day: Date) =>
    slots.filter((s) => s.slot_date === format(day, "yyyy-MM-dd"));

  const getDayState = (day: Date): "past" | "booked" | "partial" | "available" => {
    if (isBefore(day, today)) return "past";
    const daySlots = slotsForDay(day);
    if (daySlots.length === 0) return "available";
    const allBooked = daySlots.every((s) => !s.is_available);
    if (allBooked) return "booked";
    const allAvailable = daySlots.every((s) => s.is_available);
    if (allAvailable) return "available";
    return "partial";
  };

  const handleSlotToggle = async (slotType: string, makeAvailable: boolean) => {
    if (!selectedDate || !selectedVenueId) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setUpdatingSlot(slotType);
    await updateVenueSlot(selectedVenueId, dateStr, slotType, makeAvailable);
    await fetchSlots();
    setUpdatingSlot(null);
  };

  const getSlotStatus = (slotType: string): boolean | null => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slot = slots.find(
      (s) => s.slot_date === dateStr && s.slot_type === slotType
    );
    if (!slot) return null;
    return slot.is_available;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loadingVenues) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Availability Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your venue&apos;s slot availability</p>
        </div>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No venues yet</p>
          <p className="text-sm text-gray-400">
            Create a venue first from the <strong>My Venues</strong> page to manage availability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Availability Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mark dates as available or booked for your venue
          </p>
        </div>
        {venues.length > 1 && (
          <select
            value={selectedVenueId}
            onChange={(e) => {
              setSelectedVenueId(e.target.value);
              setSelectedDate(null);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        )}
      </div>

      {venues.length === 1 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--color-charcoal)]">{venues[0].name}</p>
            <p className="text-xs text-gray-500">{venues[0].city}, {venues[0].state}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {loadingSlots ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}
            {days.map((day) => {
              const state = getDayState(day);
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              const daySlots = slotsForDay(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => state !== "past" && setSelectedDate(day)}
                  disabled={state === "past"}
                  className={`h-16 rounded-lg text-sm transition-all relative flex flex-col items-center justify-center gap-0.5
                    ${state === "past" ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                    ${isSelected ? "ring-2 ring-[var(--color-primary)] ring-offset-1 bg-gradient-gold text-white" : ""}
                    ${!isSelected && state === "available" ? "bg-green-50 text-green-800" : ""}
                    ${!isSelected && state === "booked" ? "bg-red-50 text-red-800" : ""}
                    ${!isSelected && state === "partial" ? "bg-amber-50 text-amber-800" : ""}
                  `}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {state !== "past" && !isSelected && (
                    <div className="flex gap-0.5">
                      {daySlots.map((s) => (
                        <span
                          key={s.id}
                          className={`h-1.5 w-1.5 rounded-full ${s.is_available ? "bg-green-400" : "bg-red-400"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Click a button to toggle availability for each time slot
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: "morning", label: "Morning", icon: Sun, time: "6:00 AM - 2:00 PM", colorAvail: "bg-amber-50 border-amber-200 text-amber-700", colorBooked: "bg-amber-100 border-amber-300" },
              { type: "evening", label: "Evening", icon: Moon, time: "4:00 PM - 12:00 AM", colorAvail: "bg-indigo-50 border-indigo-200 text-indigo-700", colorBooked: "bg-indigo-100 border-indigo-300" },
              { type: "full_day", label: "Full Day", icon: Clock, time: "6:00 AM - 12:00 AM", colorAvail: "bg-emerald-50 border-emerald-200 text-emerald-700", colorBooked: "bg-emerald-100 border-emerald-300" },
            ].map((slot) => {
              const status = getSlotStatus(slot.type);
              const isUpdating = updatingSlot === slot.type;
              return (
                <div key={slot.type} className={`rounded-xl p-4 border-2 ${slot.colorAvail}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <slot.icon className="h-5 w-5" />
                    <h4 className="font-semibold">{slot.label}</h4>
                  </div>
                  <p className="text-xs opacity-75 mb-2">{slot.time}</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
                    status === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      status === false ? "bg-red-500" : "bg-green-500"
                    }`} />
                    {status === false ? "Booked" : "Available"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === true ? "default" : "secondary"}
                      className="flex-1 text-xs"
                      loading={isUpdating && status !== true}
                      disabled={isUpdating}
                      onClick={() => handleSlotToggle(slot.type, true)}
                    >
                      {status === true ? "✓ " : ""}Available
                    </Button>
                    <Button
                      size="sm"
                      variant={status === false ? "accent" : "secondary"}
                      className="flex-1 text-xs"
                      loading={isUpdating && status !== false}
                      disabled={isUpdating}
                      onClick={() => handleSlotToggle(slot.type, false)}
                    >
                      {status === false ? "✓ " : ""}Booked
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-400" /> Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-400" /> Booked
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-400" /> Partially Booked
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-200" /> Past
        </div>
      </div>
    </div>
  );
}
