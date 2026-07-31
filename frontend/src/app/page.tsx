"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Youtube, BookOpen, Zap, Brain, FileText, Layers, HelpCircle,
  Network, Clock, MessageSquare, ChevronRight, Star, ArrowRight,
  Play, BarChart3, CheckCircle, Cpu
} from "lucide-react";
import { UrlInput } from "@/components/url-input";
import { ThemeToggle } from "@/components/theme-toggle";

// ── Animated counter hook ─────────────────────────────────────────
function useCounter(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Feature card data ──────────────────────────────────────────────
const FEATURES = [
  { icon: FileText,     label: "Smart Summary",     desc: "Executive + chapter-level summaries in seconds",       color: "feature-violet", glow: "card-glow-violet", delay: "delay-100" },
  { icon: Layers,       label: "Flashcards",         desc: "Auto-generated Q&A cards to drill key concepts",       color: "feature-blue",   glow: "card-glow-blue",   delay: "delay-200" },
  { icon: HelpCircle,   label: "20-Question Quiz",   desc: "MCQ quiz with instant scoring and explanations",       color: "feature-emerald", glow: "card-glow-emerald", delay: "delay-300" },
  { icon: Network,      label: "Mind Map",           desc: "Visual knowledge graph of the video's main ideas",     color: "feature-cyan",   glow: "card-glow-blue",   delay: "delay-400" },
  { icon: BookOpen,     label: "Structured Notes",   desc: "Organized notes with headings, bullets, highlights",   color: "feature-amber",  glow: "card-glow-amber",  delay: "delay-100" },
  { icon: Brain,        label: "RAG AI Chat",        desc: "Ask questions — AI answers from the video's content",  color: "feature-rose",   glow: "card-glow-violet", delay: "delay-200" },
  { icon: Clock,        label: "Timeline",           desc: "Chronological event map with timestamps",              color: "feature-indigo", glow: "card-glow-blue",   delay: "delay-300" },
  { icon: MessageSquare,label: "Interview Prep",     desc: "Mock interview questions from the video topic",        color: "feature-pink",   glow: "card-glow-violet", delay: "delay-400" },
];

// ── How it works steps ─────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Paste any YouTube URL", desc: "Shorts, lectures, tutorials — any video with a transcript works", icon: Youtube },
  { num: "02", title: "AI analyzes in 60–90s", desc: "We extract, chunk, embed and run the full generation pipeline", icon: Brain },
  { num: "03", title: "Study with 10+ tools",  desc: "Switch between quiz, flashcards, mindmap, chat and more", icon: Sparkles },
];

// ── Floating study card (decorative) ──────────────────────────────
function FloatingCard({ className, style, children }: { className: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={style} className={`absolute hidden lg:flex glass-card p-3 gap-2 items-center text-xs font-medium text-foreground pointer-events-none select-none ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const v1 = useCounter(50000, 1800, statsVisible);
  const v2 = useCounter(10, 800, statsVisible);
  const v3 = useCounter(90, 1200, statsVisible);

  useEffect(() => {
    // Trigger hero animation immediately
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">

      {/* ── Animated mesh background ──────────────────────── */}
      <div className="fixed inset-0 hero-mesh pointer-events-none -z-10" />
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: "3s" }} />

      {/* ── Navbar ────────────────────────────────────────── */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple-500/30 animate-pulse-glow">
              <Youtube className="w-5 h-5" />
            </div>
            <span className="font-black text-lg gradient-text">YLearn</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────── */}
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">

          {/* Floating decorative cards */}
          <FloatingCard className="top-16 left-8 animate-card-float shadow-xl">
            <div className="w-6 h-6 rounded-lg feature-emerald border flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Quiz ready!</div>
              <div className="text-muted-foreground text-[10px]">20 MCQs generated</div>
            </div>
          </FloatingCard>

          <FloatingCard className="top-32 right-10 animate-card-float-reverse shadow-xl">
            <div className="w-6 h-6 rounded-lg feature-blue border flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">15 Flashcards</div>
              <div className="text-muted-foreground text-[10px]">Ready to study</div>
            </div>
          </FloatingCard>

          <FloatingCard className="bottom-28 left-4 animate-float shadow-xl" style={{ animationDelay: "2s" }}>
            <div className="w-6 h-6 rounded-lg feature-violet border flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">AI Chat active</div>
              <div className="text-muted-foreground text-[10px]">Ask anything</div>
            </div>
          </FloatingCard>

          <FloatingCard className="bottom-36 right-6 animate-card-float shadow-xl" style={{ animationDelay: "1s" }}>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-foreground">Analysis complete ✨</span>
          </FloatingCard>

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI-POWERED · 10+ STUDY TOOLS · INSTANT GENERATION</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] max-w-5xl mb-6 transition-all duration-700 delay-100 font-display ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Turn any YouTube video into{" "}
            <span className="gradient-text">a complete study kit</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Paste a URL. Get flashcards, quizzes, mind maps, AI chat, summaries and 6 more tools — all generated in under 2 minutes.
          </p>

          {/* URL Input */}
          <div className={`w-full transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <UrlInput />
          </div>

          {/* Social proof stars */}
          <div className={`flex items-center gap-2 mt-8 text-sm text-muted-foreground transition-all duration-700 delay-500 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
            </div>
            <span>Students love it — stop re-watching, start studying smarter</span>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────── */}
        <div ref={statsRef} className="border-y border-border/30 bg-card/40 backdrop-blur-md py-10">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black gradient-text font-display">{v1.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground mt-1">Videos analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-black gradient-text font-display">{v2}+</div>
              <div className="text-sm text-muted-foreground mt-1">Study tools</div>
            </div>
            <div>
              <div className="text-4xl font-black gradient-text font-display">{v3}s</div>
              <div className="text-sm text-muted-foreground mt-1">Avg generation time</div>
            </div>
          </div>
        </div>

        {/* ── Features Grid ─────────────────────────────────── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
              <Sparkles className="w-3 h-3" />
              EVERYTHING A STUDENT NEEDS
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight font-display">
              10 tools. One video. <span className="gradient-text">Zero boredom.</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every tool is instantly generated from the video — no manual work, no copy-paste, no wasted time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className={`glass-card p-5 space-y-3 animate-fade-up ${f.delay} ${f.glow} cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground font-display">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        <section id="how-it-works" className="bg-card/30 border-y border-border/30 py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 mb-4">
                <Zap className="w-3 h-3" />
                HOW IT WORKS
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight font-display">
                From URL to study kit <span className="gradient-text">in 3 steps</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* connector line */}
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-violet-500/20 via-violet-500/60 to-violet-500/20" />

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="glass-card p-6 space-y-4 text-center relative animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="relative mx-auto w-16 h-16">
                      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-purple-500/25">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary text-primary text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <div className="font-black text-sm text-muted-foreground tracking-widest">{step.num}</div>
                    <h3 className="font-bold text-lg text-foreground leading-tight font-display">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Why it takes time explainer */}
            <div className="mt-10 glass-card p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl feature-violet border shrink-0 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Why does it take 60–90 seconds?</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We&apos;re doing serious work under the hood: fetching the transcript, splitting it into chunks, creating vector embeddings with ChromaDB, then running <strong className="text-foreground">10+ parallel AI prompts</strong> through your selected LLM (Gemini/GPT/Ollama) to generate every study tool simultaneously. That&apos;s not slow — that&apos;s thorough.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 font-display">
            Stop re-watching. <span className="gradient-text">Start studying.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Paste any YouTube link below and let AI build your entire study session.
          </p>
          <UrlInput />
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-8 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <Youtube className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">YLearn</span>
            <span>© 2026 · All rights reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">FastAPI</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-semibold">Next.js 15</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold">LangChain</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold">ChromaDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
