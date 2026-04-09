import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JarvisOrb } from "@/components/JarvisOrb";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Master App – Command Center",
  description: "Dashboard multi-apps : Auclaire, Defcon, Viva Vegas, DRS. Stats, finances, recherche omni, J.A.R.V.I.S.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <JarvisOrb />
      </body>
    </html>
  );
}
