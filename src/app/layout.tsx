import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
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

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CodeReel — Animate your code. Share your story.",
  description: "Animate your code. Share your story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <html
        lang="en"
        className={`${inter.variable} ${firaCode.variable} dark`}
        suppressHydrationWarning
      >
        <body suppressHydrationWarning>
          {children}
          <Toaster richColors position="top-center" />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ""} />
        </body>
      </html>
    </ViewTransition>
  );
}
