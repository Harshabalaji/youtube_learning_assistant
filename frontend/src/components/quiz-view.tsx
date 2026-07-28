"use client";

import { useQuiz } from "@/hooks/useQuiz";
import type { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { formatDuration, getDifficultyColor } from "@/lib/utils";

interface QuizViewProps {
  questions?: QuizQuestion[];
}

export function QuizView({ questions = [] }: QuizViewProps) {
  const quiz = useQuiz(questions);

  if (!questions.length) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No quiz questions available.
      </div>
    );
  }

  const currentQ = questions[quiz.currentQuestion];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Interactive Quiz</h3>
            <p className="text-xs text-muted-foreground">
              {quiz.totalQuestions} Questions • Test your understanding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{formatDuration(quiz.timeElapsed)}</span>
          </div>

          <Badge variant="outline" className="font-medium">
            {quiz.answeredCount} / {quiz.totalQuestions} Answered
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={quiz.progress} className="h-2" />

      {/* Active Quiz View */}
      {!quiz.isCompleted ? (
        <div className="glass-card p-6 md:p-8 space-y-6">
          {/* Question Title & Info */}
          <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase">
                Question {quiz.currentQuestion + 1} of {quiz.totalQuestions}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug">
                {currentQ?.question}
              </h2>
            </div>
            <Badge variant="outline" className={getDifficultyColor(currentQ?.difficulty || "medium")}>
              {(currentQ?.difficulty || "medium").toUpperCase()}
            </Badge>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ?.options?.map((option, idx) => {
              const isSelected = quiz.answers[quiz.currentQuestion] === idx;
              const optionPrefix = ["A", "B", "C", "D"][idx] || `${idx + 1}`;

              return (
                <button
                  key={idx}
                  onClick={() => quiz.selectAnswer(quiz.currentQuestion, idx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-md ring-2 ring-primary/20"
                      : "bg-background/40 hover:bg-accent border-border/60 text-foreground/90"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {optionPrefix}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
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
        /* Results View */
        <div className="glass-card p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-500/20">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Quiz Completed!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Time taken: {formatDuration(quiz.timeElapsed)}
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
              <span className="text-xs text-muted-foreground font-medium">Score</span>
              <p className="text-2xl font-bold text-primary">
                {quiz.score} / {quiz.totalQuestions}
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
              <span className="text-xs text-muted-foreground font-medium">Accuracy</span>
              <p className="text-2xl font-bold text-emerald-500">
                {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
              <span className="text-xs text-muted-foreground font-medium">Grade</span>
              <p className="text-2xl font-bold text-indigo-500">
                {quiz.score / quiz.totalQuestions >= 0.8
                  ? "A"
                  : quiz.score / quiz.totalQuestions >= 0.6
                  ? "B"
                  : "C"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
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
            <div className="mt-8 space-y-4 text-left border-t border-border/50 pt-6">
              <h3 className="font-bold text-lg text-foreground">Answer Review</h3>

              {questions.map((q, idx) => {
                const userAnswer = quiz.answers[idx];
                const isCorrect = userAnswer === q.correct_answer;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-foreground">
                        Q{idx + 1}: {q.question}
                      </span>
                      {isCorrect ? (
                        <Badge variant="success" className="gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 shrink-0">
                          <XCircle className="w-3 h-3" /> Incorrect
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg ${
                            oIdx === q.correct_answer
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold"
                              : oIdx === userAnswer
                              ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 line-through"
                              : "text-muted-foreground"
                          }`}
                        >
                          {["A", "B", "C", "D"][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 italic">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
