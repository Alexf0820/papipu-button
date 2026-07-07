import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
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
  title: "PapipuButton",
  description: "One Button. One World. — by Project PapipupePopcorn",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseConfig = getSupabasePublicConfig();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `window.__PapipuSupabaseConfig=${JSON.stringify(supabaseConfig)};`,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- tatakuna.js と同じ素の script 読み込み */}
        <script src="/papipu-audio.js" suppressHydrationWarning />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- tatakuna.js と同じ素の script 読み込み */}
        <script src="/papipu-button.js" suppressHydrationWarning />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- 世界カウンター（音声とは独立） */}
        <script src="/papipu-counter.js" suppressHydrationWarning />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- Milestone Card（音声・カウンター処理とは独立） */}
        <script src="/papipu-milestone.js" suppressHydrationWarning />
      </body>
    </html>
  );
}
