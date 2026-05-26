import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aliyah Navigator | Olim Paveway",
  description:
    "Get your personalised aliyah action plan in 60 seconds. Free tool by Olim Paveway.",
  openGraph: {
    title: "Aliyah Navigator | Olim Paveway",
    description:
      "Answer 8 questions. Get a custom PDF aliyah plan sent to your inbox.",
    siteName: "Olim Paveway",
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
