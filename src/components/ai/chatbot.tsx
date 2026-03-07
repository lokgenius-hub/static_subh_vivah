"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvuxmnysvmebwpiupink.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dXhtbnlzdm1lYndwaXVwaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjkxNzQsImV4cCI6MjA4ODAwNTE3NH0.hT0XA9KvGk-tEwOM2L1rNCddgDP55gOeNHFBQ6qMWRc";

export function AIChatbot() {
  const [isOpen, setIsOpen]     = useState(false);
  const [inputValue, setInput]  = useState("");
  const [isLoading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const WELCOME: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
      "Namaste! 🙏 Main hoon aapka VivahSthal Wedding Assistant!\n\nMain aapki madad kar sakta hun:\n" +
      "• Bhabua / Kaimur ke best venues dhundne mein\n" +
      "• Budget aur capacity ke hisaab se suggest karne mein\n" +
      "• Shubh muhurat aur booking process samjhane mein\n\nBataiye, kya dhundh rahe hain? 😊",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setChatError("");

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply: string =
        data.reply ??
        data.error ??
        "Kuch gadbad ho gayi. Please thodi der mein try karein.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_a", role: "assistant", content: reply },
      ]);
    } catch {
      setChatError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-2xl flex items-center justify-center hover:shadow-3xl hover:scale-105 transition-all group"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-accent)] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Wedding Assistant
                  </h3>
                  <p className="text-white/70 text-xs">
                    AI-powered by VivahSthal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2.5",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-[var(--color-charcoal)] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              {chatError && (
                <p className="text-center text-xs text-red-500 py-1">{chatError}</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {[
                  "Find venues in Patna",
                  "Auspicious dates 2026",
                  "Budget under ₹3 Lakh",
                  "Banquet for 300 guests",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[11px] px-3 py-1.5 bg-[var(--color-primary)]/5 text-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)]/10 transition-colors border border-[var(--color-primary)]/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-gray-100 flex gap-2 shrink-0"
            >
              <input
                value={inputValue}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white disabled:opacity-50 hover:brightness-110 transition-all shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
