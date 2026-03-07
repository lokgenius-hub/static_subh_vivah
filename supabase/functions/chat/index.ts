// Supabase Edge Function: /functions/v1/chat
// Plain JSON response (no streaming) — works reliably with static Next.js export.
//
// Deploy:     supabase functions deploy chat
// Set secret: supabase secrets set GROQ_API_KEY=gsk_...
//
// POST { messages: [{role, content}] }  →  { reply: "..." }

// No npm imports needed — plain fetch to GROQ REST API

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are VivahSthal's friendly wedding venue assistant for Kaimur District, Bihar, India.

Your job:
- Help couples find the right marriage hall / lawn / vatika in Bhabua, Mohania, and nearby Kaimur towns
- Answer questions about venue capacity, pricing, amenities, availability
- Suggest venues based on budget and guest count
- Share information about auspicious wedding dates (shubh muhurat)
- Encourage users to fill the enquiry form for booking

Personality: Warm, helpful, conversational. Mix Hindi phrases naturally (Ji, Namaste, Bahut badhiya, etc).
Keep answers SHORT — 2-4 sentences max unless asked for detail.
Always end with a helpful next step like "Enquiry form bharo" or "Contact karo".

Price ranges in Kaimur: ₹30,000 – ₹3,00,000 per slot.
Venue types: Marriage Hall, Vatika (Lawn), Palace, Resort.
Cities covered: Bhabua, Mohania, Ramgarh, Chainpur, Durgawati.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Normalise messages — support both plain content and Vercel AI UIMessage parts format
    type RawMsg = { role?: string; content?: string; parts?: Array<{type: string; text?: string}> };
    let userMessages: Array<{ role: string; content: string }> = [];

    if (Array.isArray(body.messages)) {
      userMessages = (body.messages as RawMsg[]).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
          ? String(m.content)
          : Array.isArray(m.parts)
          ? m.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("")
          : "",
      })).filter((m) => m.content.trim() !== "");
    } else if (typeof body.message === "string") {
      userMessages = [{ role: "user", content: body.message }];
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured. Run: supabase secrets set GROQ_API_KEY=gsk_..." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...userMessages,
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("GROQ error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content
      ?? "Maafi chahta hun, abhi jawab nahi de pa raha. Thodi der mein try karein. 🙏";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Chat edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
