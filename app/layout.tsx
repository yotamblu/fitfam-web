import type { Metadata, Viewport } from "next";
import { Assistant, Heebo } from "next/font/google";
import StatusBarTint from "@/components/StatusBarTint";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["600", "700", "800", "900"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FitFam | אימון היברידי, רצף, קהילה",
  description:
    "FitFam - תוכניות אימון היברידיות (כוח + סיבולת) עם נקודות, רצפים ולוחות דירוג, בקהילה אמיתית.",
  applicationName: "FitFam",
  appleWebApp: { capable: true, title: "FitFam", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  // Next only emits the unprefixed mobile-web-app-capable tag; iOS needs the apple- one
  // for the translucent status bar (content flowing under it) to apply in the installed PWA.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#131314",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas font-body text-text-primary">
        {children}
        <StatusBarTint />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
