import type { Metadata, Viewport } from "next";
import { portfolio } from "@/config/portfolio";
import OscilloscopeBackdrop from "@/components/OscilloscopeBackdrop";
import BackgroundAudio from "@/components/BackgroundAudio";
import "@fontsource/vt323/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `${portfolio.name} | Developer Terminal`,
  description: `${portfolio.name}'s terminal-style portfolio: systems, AI, optimization, and a shared GitHub + LeetCode activity calendar.`,
};
export const viewport: Viewport = { themeColor: "#070e09" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><OscilloscopeBackdrop />{children}<BackgroundAudio /></body></html>;
}
