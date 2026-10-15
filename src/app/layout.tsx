import type { Metadata, Viewport } from "next";
import { portfolio } from "@/config/portfolio";
import OscilloscopeBackdrop from "@/components/OscilloscopeBackdrop";
import BackgroundAudio from "@/components/BackgroundAudio";
import AppearanceControls from "@/components/AppearanceControls";
import { APPEARANCE_BOOTSTRAP } from "@/lib/appearance";
import "@fontsource/vt323/latin-400.css";
import "./globals.css";
import "./appearance.css";

export const metadata: Metadata = {
  title: `${portfolio.name} | Developer Terminal`,
  description: `${portfolio.name}'s terminal-style portfolio: systems, AI, optimization, and a shared GitHub + LeetCode activity calendar.`,
};
export const viewport: Viewport = { themeColor: "#070e09" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP }} /></head><body><OscilloscopeBackdrop />{children}<AppearanceControls /><BackgroundAudio /></body></html>;
}
