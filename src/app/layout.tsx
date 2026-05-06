import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ViewTransition } from "react";
import "shiki-magic-move/dist/style.css";

import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codereel.dev"),
  title: "CodeReel — Animate your code. Share your story.",
  description: "Animate your code. Share your story.",
  openGraph: {
    title: "CodeReel — Animate your code. Share your story.",
    description: "Animate your code. Share your story.",
    url: "https://codereel.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeReel — Animate your code. Share your story.",
    description: "Animate your code. Share your story.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
          <Toaster richColors position="top-center" />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ""} />
        </body>
      </html>
    </ViewTransition>
  );
}
