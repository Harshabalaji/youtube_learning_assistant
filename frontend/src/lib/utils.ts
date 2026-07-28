import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes (shadcn/ui pattern).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds to a readable duration string.
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format large numbers with commas.
 */
export function formatNumber(num: number): string {
  if (!num) return "0";
  return num.toLocaleString();
}

/**
 * Truncate text to a maximum length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get difficulty color classes.
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/**
 * Get priority color classes.
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-rose-500/10 text-rose-500";
    case "medium":
      return "bg-amber-500/10 text-amber-500";
    case "low":
      return "bg-emerald-500/10 text-emerald-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}
