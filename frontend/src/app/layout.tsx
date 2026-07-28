import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: "YouTube Learning Assistant — AI-Powered Study Material Generator",
  description:
    "Transform any YouTube video into comprehensive study materials, flashcards, quizzes, mind maps, and more using AI.",
  keywords: [
    "YouTube",
    "learning",
    "AI",
    "study materials",
    "flashcards",
    "quiz",
    "mind map",
    "notes",
    "transcript",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
