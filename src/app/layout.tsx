import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { SPARedirectHandler } from "@/components/spa-redirect";

export const metadata: Metadata = {
  title: "VivahSthal - Best Wedding Venues in Bhabua, Sasaram & Kaimur | Bihar",
  description:
    "Find and book the perfect wedding venue in Bhabua, Sasaram, Mohania, Chainpur, Dehri & Kaimur district. Banquet halls, lawns, farmhouses & resorts with real-time availability. Silver, Golden & Diamond wedding packages starting ₹1.5 Lakh.",
  keywords: [
    "wedding venue Bhabua",
    "wedding venue Sasaram",
    "marriage hall Kaimur",
    "banquet hall Rohtas",
    "wedding lawn Mohania",
    "shaadi venue Chainpur",
    "vivah sthal",
    "wedding package Bihar",
    "wedding booking Dehri",
    "marriage venue Bikramganj",
    "wedding photography Bhabua",
    "catering service Sasaram",
  ],
  openGraph: {
    title: "VivahSthal - Premium Wedding Venues in Bhabua, Sasaram & Kaimur",
    description: "Find and book your dream wedding venue in Kaimur & Rohtas district with packages starting ₹1.5 Lakh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[var(--color-cream)] text-[var(--color-charcoal)]">
        <AuthProvider>
          <SPARedirectHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
