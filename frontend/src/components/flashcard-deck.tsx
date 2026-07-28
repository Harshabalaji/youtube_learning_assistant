"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Shuffle,
  Check,
  Filter,
  Brain,
  Award,
} from "lucide-react";
import type { Flashcard } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils";
import { toggleFlashcardBookmark } from "@/lib/api";

interface FlashcardDeckProps {
  flashcards?: Flashcard[];
}

export function FlashcardDeck({ flashcards: initialFlashcards = [] }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Filtered Cards
  const filteredCards = cards.filter((card) => {
    if (filterDifficulty !== "all" && card.difficulty !== filterDifficulty) return false;
    if (onlyBookmarks && !card.is_bookmarked) return false;
    return true;
  });

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

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

  if (!cards.length) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No flashcards available.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm text-foreground">
            Flashcard Deck ({filteredCards.length} cards)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl text-xs">
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setFilterDifficulty(diff);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                  filterDifficulty === diff
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {diff}
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
            className="gap-1.5 text-xs"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({cards.filter((c) => c.is_bookmarked).length})</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </Button>
        </div>
      </div>

      {/* 3D Flashcard */}
      {currentCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 min-h-[320px] relative select-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (isFlipped ? "-back" : "-front")}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full min-h-[320px] glass-card p-8 flex flex-col justify-between relative border-2 border-primary/20 hover:border-primary/40 shadow-xl"
              >
                {/* Top Badge & Bookmark */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
                      {currentCard.difficulty.toUpperCase()}
                    </Badge>
                    {currentCard.category && (
                      <Badge variant="secondary" className="text-xs">
                        {currentCard.category}
                      </Badge>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(currentCard.id);
                    }}
                    className={`p-2 rounded-xl transition ${
                      currentCard.is_bookmarked
                        ? "bg-amber-500/20 text-amber-500"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${currentCard.is_bookmarked ? "fill-amber-500" : ""}`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="my-auto text-center px-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    {isFlipped ? "Answer" : "Question"}
                  </span>
                  <p className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </p>
                </div>

                {/* Card Footer hint */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                  <span>
                    Card {currentIndex + 1} of {filteredCards.length}
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
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
        <div className="p-12 text-center text-muted-foreground glass-card space-y-3">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p>No cards match the current filter criteria.</p>
          <Button variant="outline" size="sm" onClick={() => setFilterDifficulty("all")}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
