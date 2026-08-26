import type { Metadata, Viewport } from "next";
import { Fredoka, Baloo_2, Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/AuthProvider";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka" });
const baloo = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-baloo" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BEEEEERS",
  description: "La classifica delle birre del gruppo",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#221609",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fredoka.variable} ${baloo.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
