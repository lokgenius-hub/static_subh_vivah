import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// AI Chatbot disabled for static export — needs Supabase Edge Function for GROQ API key
// import { AIChatbot } from "@/components/ai/chatbot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
      {/* <AIChatbot /> */}
    </>
  );
}
