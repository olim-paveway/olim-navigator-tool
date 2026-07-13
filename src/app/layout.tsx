import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Aliyah Navigator | Free Personalised Aliyah Plan | Olim Paveway",
  description:
    "Get your personalised aliyah action plan in 60 seconds. Answer 8 questions and receive a free PDF plan tailored to your country and family. By Olim Paveway.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aliyah Navigator | Free Personalised Aliyah Plan",
    description:
      "Answer 8 questions. Get a custom PDF aliyah plan sent to your inbox — free, in 60 seconds.",
    siteName: "Olim Paveway",
    url: "/",
    type: "website",
    locale: "en_US",
  },
  // Twitter falls back to openGraph title/description automatically
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-cream min-h-screen antialiased">{children}</body>
    </html>
  );
}
