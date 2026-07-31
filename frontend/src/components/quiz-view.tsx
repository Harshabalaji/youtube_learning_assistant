"use client";

import { useQuiz } from "@/hooks/useQuiz";
import type { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Eye,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Star,
  Zap,
  Target,
} from "lucide-react";
import { formatDuration, getDifficultyColor } from "@/lib/utils";

interface QuizViewProps {
  questions?: QuizQuestion[];
}

// ── Score tier config ─────────────────────────────────────────────
function getScoreTier(pct: number) {
  if (pct >= 90) return { grade: "A+", label: "Outstanding!", color: "text-emerald-400", bg: "from-emerald-500 to-teal-500", icon: "🏆" };
  if (pct >= 80) return { grade: "A",  label: "Excellent!",    color: "text-emerald-400", bg: "from-emerald-500 to-green-500", icon: "⭐" };
  if (pct >= 70) return { grade: "B",  label: "Great work!",   color: "text-blue-400",    bg: "from-blue-500 to-indigo-500",   icon: "👍" };
  if (pct >= 60) return { grade: "C",  label: "Good effort!",  color: "text-amber-400",   bg: "from-amber-500 to-orange-500",  icon: "📚" };
  return              { grade: "D",  label: "Keep studying!", color: "text-rose-400",    bg: "from-rose-500 to-pink-500",     icon: "💪" };
}

export function QuizView({ questions = [] }: QuizViewProps) {
  const quiz = useQuiz(questions);

  if (!questions.length) {
    return (
      <div className="p-12 text-center text-muted-foreground glass-card space-y-3">
        <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="font-medium">No quiz questions available.</p>
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const scorePct = quiz.isCompleted
    ? Math.round((quiz.score / quiz.totalQuestions) * 100)
    : 0;
  const tier = getScoreTier(scorePct);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* ── Quiz Header ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl feature-emerald border flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground font-display">Interactive Quiz</h3>
            <p className="text-xs text-muted-foreground">
              {quiz.totalQuestions} Questions · Test your understanding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed timer */}
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-foreground">
            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>{formatDuration(quiz.timeElapsed)}</span>
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl text-xs font-bold text-primary border border-primary/20">
            <Target className="w-3.5 h-3.5" />
            <span>{quiz.answeredCount} / {quiz.totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────── */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{ width: `${quiz.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
          <span>Question {quiz.currentQuestion + 1} of {quiz.totalQuestions}</span>
          <span>{Math.round(quiz.progress)}% complete</span>
        </div>
      </div>

      {/* ── Active Quiz View ──────────────────────────────── */}
      {!quiz.isCompleted ? (
        <div className="glass-card p-6 md:p-8 space-y-6">
          {/* Question header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Question {quiz.currentQuestion + 1}
                </span>
                <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(currentQ?.difficulty || "medium")}`}>
                  {(currentQ?.difficulty || "medium").toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug font-display">
                {currentQ?.question}
              </h2>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ?.options?.map((option, idx) => {
              const isSelected = quiz.answers[quiz.currentQuestion] === idx;
              const optionPrefix = ["A", "B", "C", "D"][idx] || `${idx + 1}`;

              return (
                <button
                  key={idx}
                  onClick={() => quiz.selectAnswer(quiz.currentQuestion, idx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all duration-200 group ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/20 scale-[1.01]"
                      : "bg-background/40 hover:bg-accent/60 border-border/50 text-foreground/90 hover:border-border hover:scale-[1.005]"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "gradient-bg text-white shadow-md shadow-primary/30"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {optionPrefix}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{option}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={quiz.prevQuestion}
              disabled={quiz.currentQuestion === 0}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {quiz.currentQuestion === quiz.totalQuestions - 1 ? (
              <Button
                variant="gradient"
                onClick={quiz.submitQuiz}
                className="gap-2 rounded-xl font-bold px-6"
              >
                <span>Submit Quiz</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={quiz.nextQuestion}
                className="gap-2 rounded-xl"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── Results View ─────────────────────────────── */
        <div className="glass-card overflow-hidden">
          {/* Score gradient header */}
          <div className={`bg-gradient-to-br ${tier.bg} p-8 text-white text-center relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Trophy className="w-48 h-48" />
            </div>

            <div className="relative">
              <div className="text-5xl mb-2">{tier.icon}</div>
              <div className="text-6xl font-black mb-1">{scorePct}%</div>
              <div className="text-xl font-bold opacity-90">{tier.label}</div>
              <div className="text-sm opacity-70 mt-1">
                {quiz.score} / {quiz.totalQuestions} correct · {formatDuration(quiz.timeElapsed)}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Score breakdown cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
                <div className="text-2xl font-black text-foreground">{quiz.score}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Correct</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
                <div className="text-2xl font-black text-rose-400">{quiz.totalQuestions - quiz.score}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Wrong</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
                <div className={`text-2xl font-black ${tier.color}`}>{tier.grade}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Grade</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={quiz.toggleReview}
                className="gap-2 rounded-xl"
              >
                <Eye className="w-4 h-4" />
                <span>{quiz.showReview ? "Hide Answers" : "Review Answers"}</span>
              </Button>

              <Button
                variant="gradient"
                onClick={quiz.resetQuiz}
                className="gap-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </Button>
            </div>

            {/* Review Answers List */}
            {quiz.showReview && (
              <div className="space-y-4 border-t border-border/50 pt-5">
                <h3 className="font-bold text-base text-foreground font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Answer Review
                </h3>

                {questions.map((q, idx) => {
                  const userAnswer = quiz.answers[idx];
                  const isCorrect = userAnswer === q.correct_answer;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 space-y-3 transition-all ${
                        isCorrect
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-rose-500/5 border-rose-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                          )}
                          <span className="font-semibold text-sm text-foreground leading-snug">
                            Q{idx + 1}: {q.question}
                          </span>
                        </div>
                        <Badge
                          variant={isCorrect ? "success" : "destructive"}
                          className="shrink-0 text-[10px]"
                        >
                          {isCorrect ? "✓ Correct" : "✗ Wrong"}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                              oIdx === q.correct_answer
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold"
                                : oIdx === userAnswer
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 line-through opacity-70"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span className="font-bold w-4 shrink-0">{["A", "B", "C", "D"][oIdx]}.</span>
                            <span>{opt}</span>
                            {oIdx === q.correct_answer && (
                              <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
                          <span className="shrink-0">💡</span>
                          <p><strong className="text-foreground/80">Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
