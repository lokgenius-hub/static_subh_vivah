// Supabase Edge Function: /functions/v1/chat
// Handles AI chat with GROQ (key stored as Edge Function secret, never in codebase)
// Deploy: supabase functions deploy chat
// Set secret: supabase secrets set GROQ_API_KEY=gsk_...

import OpenAI from "npm:openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are VivahSthal's wedding venue assistant for Bihar and nearby regions of India.
Help users:
- Find venues by city, budget, capacity, and venue type
- Understand pricing (per slot, per plate)
- Learn about amenities and services
- Know auspicious wedding dates (muhurat)
- Plan their wedding timeline

Be warm, helpful, and conversational. Use respectful language (you can mix Hindi greetings like "Namaste").
Keep responses concise but informative. Always encourage users to submit an enquiry form for booking.

Key cities we cover: Patna, Gaya, Bhagalpur, Muzaffarpur, Bhabua, Aurangabad, Nalanda, and more in Bihar.
Venue types: Banquet Hall, Farmhouse, Resort, Garden/Lawn, Hotel.
Typical price range: ₹50,000 – ₹5,00,000 per slot.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured in Edge Function secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groq = new OpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Build messages for Groq (filter to role/content only)
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
          ? m.content.filter((p: { type: string }) => p.type === "text").map((p: { text: string }) => p.text).join("")
          : String(m.content),
      })),
    ];

    const stream = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: chatMessages,
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    // Stream response in Vercel AI SDK data stream v1 format
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              // AI SDK data stream format: 0:"escaped_text"\n
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
          // Finish signal
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "x-vercel-ai-data-stream": "v1",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
