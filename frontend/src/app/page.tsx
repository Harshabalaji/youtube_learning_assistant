"use client";

import { Sparkles, Youtube } from "lucide-react";
import { UrlInput } from "@/components/url-input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-violet-600/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              <Youtube className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg gradient-text">
              YouTube Learning Assistant
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center space-y-10">
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED STUDY MATERIAL GENERATOR</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-foreground">
            Convert Any YouTube Video Into{" "}
            <span className="gradient-text">Complete Study Material</span>
          </h1>

        </div>


        {/* URL Input Form */}
        <UrlInput />


      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground bg-card/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 YouTube Learning Assistant. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>FastAPI + Next.js 15 + LangChain + ChromaDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
