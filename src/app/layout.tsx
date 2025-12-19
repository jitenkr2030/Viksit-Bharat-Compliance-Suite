import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PARSS - Penalty Avoidance & Regulatory Survival System",
  description: "Comprehensive compliance management system for educational institutions. Avoid penalties ranging from ₹10L to ₹2Cr through automated regulatory compliance monitoring and reporting.",
  keywords: ["PARSS", "Penalty Avoidance", "Regulatory Compliance", "Educational Institutions", "Compliance Management", "Regulatory Survival", "Education Compliance", "Higher Education", "AICTE Compliance", "NAAC Compliance"],
  authors: [{ name: "PARSS Development Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "PARSS - Penalty Avoidance & Regulatory Survival System",
    description: "Protect your educational institution from regulatory penalties with automated compliance monitoring and reporting.",
    url: "https://parss-system.vercel.app",
    siteName: "PARSS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PARSS - Penalty Avoidance & Regulatory Survival System",
    description: "Comprehensive compliance management for educational institutions. Avoid penalties with automated monitoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
