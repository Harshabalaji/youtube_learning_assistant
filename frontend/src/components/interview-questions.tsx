"use client";

import { useState } from "react";
import { Briefcase, Eye, EyeOff, HelpCircle } from "lucide-react";
import type { InterviewQuestion } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDifficultyColor } from "@/lib/utils";

interface InterviewQuestionsProps {
  interview?: { questions: InterviewQuestion[] };
}

export function InterviewQuestions({ interview }: InterviewQuestionsProps) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const questions = interview?.questions || [];

  const toggleReveal = (idx: number) => {
    setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRevealAll = () => {
    const allRevealed = Object.keys(revealed).length === questions.length;
    if (allRevealed) {
      setRevealed({});
    } else {
      const newRevealed: Record<number, boolean> = {};
      questions.forEach((_, idx) => (newRevealed[idx] = true));
      setRevealed(newRevealed);
    }
  };

  if (!questions.length) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No interview questions generated.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between glass-card p-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">
            Interview Questions & Answers ({questions.length})
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleRevealAll}
          className="gap-1.5 text-xs"
        >
          {Object.keys(revealed).length === questions.length ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide All Answers</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal All Answers</span>
            </>
          )}
        </Button>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isRevealed = !!revealed[idx];

          return (
            <Card key={idx} className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                    {q.difficulty.toUpperCase()}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReveal(idx)}
                    className="gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show Suggested Answer</span>
                      </>
                    )}
                  </Button>

                  {q.category && (
                    <span className="text-xs text-muted-foreground">
                      Category: {q.category}
                    </span>
                  )}
                </div>

                {isRevealed && (
                  <div className="p-4 rounded-xl bg-accent/40 border border-border/50 text-sm text-foreground leading-relaxed animate-fade-in">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary block mb-1">
                      Suggested Answer:
                    </span>
                    {q.suggested_answer || q.answer}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
