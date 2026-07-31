"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Shuffle,
  Brain,
  Award,
  Keyboard,
} from "lucide-react";
import type { Flashcard } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils";
import { toggleFlashcardBookmark } from "@/lib/api";

interface FlashcardDeckProps {
  flashcards?: Flashcard[];
}

// ── Difficulty config ──────────────────────────────────────────────
const DIFF_CONFIG: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  easy:   { bg: "bg-emerald-500/8",  border: "border-emerald-500/25", text: "text-emerald-400",  glow: "shadow-emerald-500/15" },
  medium: { bg: "bg-amber-500/8",    border: "border-amber-500/25",   text: "text-amber-400",    glow: "shadow-amber-500/15" },
  hard:   { bg: "bg-rose-500/8",     border: "border-rose-500/25",    text: "text-rose-400",     glow: "shadow-rose-500/15" },
};

function getDiffStyle(difficulty: string) {
  return DIFF_CONFIG[difficulty?.toLowerCase()] ?? DIFF_CONFIG.medium;
}

export function FlashcardDeck({ flashcards: initialFlashcards = [] }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // Filtered Cards
  const filteredCards = cards.filter((card) => {
    if (filterDifficulty !== "all" && card.difficulty !== filterDifficulty) return false;
    if (onlyBookmarks && !card.is_bookmarked) return false;
    return true;
  });

  const currentCard = filteredCards[currentIndex];
  const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % filteredCards.length), 50);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length), 50);
  }, [filteredCards.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleToggleBookmark = async (cardId?: number) => {
    if (!cardId) return;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, is_bookmarked: !c.is_bookmarked } : c))
    );
    try {
      await toggleFlashcardBookmark(cardId);
    } catch (err) {
      console.error("Failed to bookmark card:", err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  if (!cards.length) {
    return (
      <div className="p-12 text-center text-muted-foreground glass-card space-y-3">
        <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="font-medium">No flashcards available.</p>
      </div>
    );
  }

  const diffStyle = currentCard ? getDiffStyle(currentCard.difficulty) : null;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* ── Controls Header ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl feature-cyan border flex items-center justify-center">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground block">Flashcard Deck</span>
            <span className="text-[10px] text-muted-foreground">{filteredCards.length} cards</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter pills */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs">
            {[
              { key: "all", label: "All" },
              { key: "easy", label: "Easy" },
              { key: "medium", label: "Med" },
              { key: "hard", label: "Hard" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilterDifficulty(key);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all duration-200 ${
                  filterDifficulty === key
                    ? key === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : key === "easy"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : key === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Button
            variant={onlyBookmarks ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setOnlyBookmarks(!onlyBookmarks);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="gap-1.5 text-xs h-8"
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? "fill-current" : ""}`} />
            <span>Saved ({cards.filter((c) => c.is_bookmarked).length})</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
          <span>Card {currentIndex + 1} of {filteredCards.length}</span>
          <span className="font-bold text-foreground/70">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Dot indicators for small decks */}
        {filteredCards.length <= 15 && (
          <div className="flex items-center gap-1 justify-center pt-0.5">
            {filteredCards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIsFlipped(false); setCurrentIndex(i); }}
                className={`transition-all duration-200 rounded-full ${
                  i === currentIndex
                    ? "w-4 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 3D Flashcard ───────────────────────────────── */}
      {currentCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] relative select-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (isFlipped ? "-back" : "-front")}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0, scale: 0.97 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className={`w-full min-h-[300px] rounded-2xl p-7 flex flex-col justify-between relative border-2 shadow-xl transition-colors ${
                  isFlipped
                    ? "bg-gradient-to-br from-primary/8 to-primary/3 border-primary/30 shadow-primary/15"
                    : diffStyle
                    ? `${diffStyle.bg} ${diffStyle.border} shadow-lg ${diffStyle.glow}`
                    : "glass-card border-border/50"
                }`}
              >
                {/* Flip indicator ribbon */}
                <div
                  className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-xl text-[10px] font-black uppercase tracking-wider ${
                    isFlipped
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {isFlipped ? "Answer" : "Question"}
                </div>

                {/* Top: difficulty + category + bookmark */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black uppercase ${getDifficultyColor(currentCard.difficulty)}`}
                    >
                      {currentCard.difficulty}
                    </Badge>
                    {currentCard.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {currentCard.category}
                      </Badge>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(currentCard.id);
                    }}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      currentCard.is_bookmarked
                        ? "bg-amber-500/20 text-amber-500 scale-110"
                        : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Bookmark
                      className={`w-4.5 h-4.5 ${currentCard.is_bookmarked ? "fill-amber-500" : ""}`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="my-auto text-center px-4 py-4">
                  <p
                    className={`text-lg md:text-xl font-bold leading-relaxed ${
                      isFlipped ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </p>
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-center text-xs text-muted-foreground/60 gap-1.5">
                  <RotateCw className="w-3 h-3" />
                  <span>Tap to flip</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Keyboard hints ──────────────────────────── */}
          {showHints && (
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground bg-muted/20 rounded-xl py-2 px-4 border border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="kbd">←</span>
                <span className="kbd">→</span>
                <span>Navigate</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="kbd">Space</span>
                <span>Flip card</span>
              </div>
              <button
                onClick={() => setShowHints(false)}
                className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={filteredCards.length <= 1}
              className="flex-1 gap-2 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleNext}
              disabled={filteredCards.length <= 1}
              className="flex-1 gap-2 rounded-xl"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground glass-card space-y-4">
          <Award className="w-14 h-14 text-muted-foreground/20 mx-auto" />
          <div>
            <p className="font-semibold text-foreground/80">No cards match the filter</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different difficulty or clear the bookmark filter</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setFilterDifficulty("all"); setOnlyBookmarks(false); }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
