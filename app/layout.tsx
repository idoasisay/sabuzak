import type { Metadata } from "next";
import { Geist, Geist_Mono, Silkscreen, Orbit } from "next/font/google";
import { ThemeSync } from "@/components/ThemeSync";
import { AuthSync } from "@/components/AuthSync";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400"],
});

const orbit = Orbit({
  variable: "--font-orbit",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "sabuzak",
  description: "blogblogblogblogblog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${silkscreen.variable} ${orbit.variable} antialiased`}
      >
        <ThemeSync />
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
