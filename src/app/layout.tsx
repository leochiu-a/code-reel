import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "monaco-editor/min/vs/editor/editor.main.css";
import "shiki-magic-move/dist/style.css";

import { Toaster } from "@/components/ui/sonner";

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
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} dark`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
