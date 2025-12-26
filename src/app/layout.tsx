import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import "monaco-editor/min/vs/editor/editor.main.css";
import "shiki-magic-move/dist/style.css";
import { Toaster } from "@/components/ui/sonner";

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
  title: "CodeReel",
  description: "Create beautiful code reels",
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
