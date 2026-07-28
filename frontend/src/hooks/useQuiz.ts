"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { QuizQuestion } from "@/types";

interface QuizState {
  currentQuestion: number;
  answers: (number | null)[];
  isCompleted: boolean;
  score: number;
  timeElapsed: number;
  showReview: boolean;
}

/**
 * Hook for managing quiz state — timer, scoring, navigation.
 */
export function useQuiz(questions: QuizQuestion[]) {
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    answers: new Array(questions.length).fill(null),
    isCompleted: false,
    score: 0,
    timeElapsed: 0,
    showReview: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  useEffect(() => {
    if (!state.isCompleted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isCompleted, questions.length]);

  const selectAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    setState((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = answerIndex;
      return { ...prev, answers: newAnswers };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestion: Math.min(prev.currentQuestion + 1, questions.length - 1),
    }));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestion: Math.max(prev.currentQuestion - 1, 0),
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentQuestion: index }));
  }, []);

  const submitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0;
    state.answers.forEach((answer, index) => {
      if (answer === questions[index]?.correct_answer) {
        score++;
      }
    });

    setState((prev) => ({
      ...prev,
      isCompleted: true,
      score,
    }));
  }, [state.answers, questions]);

  const toggleReview = useCallback(() => {
    setState((prev) => ({ ...prev, showReview: !prev.showReview }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      currentQuestion: 0,
      answers: new Array(questions.length).fill(null),
      isCompleted: false,
      score: 0,
      timeElapsed: 0,
      showReview: false,
    });
  }, [questions.length]);

  const answeredCount = state.answers.filter((a) => a !== null).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return {
    ...state,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    toggleReview,
    resetQuiz,
    answeredCount,
    progress,
    totalQuestions: questions.length,
  };
}
