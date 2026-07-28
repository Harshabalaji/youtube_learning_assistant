"use client";

import {
  LayoutDashboard,
  FileText,
  BookOpen,
  StickyNote,
  Layers,
  HelpCircle,
  Network,
  MessageSquare,
  Clock,
  Briefcase,
  Book,
  CheckSquare,
  List,
  MessageCircle,
  Quote,
  Zap,
  Code,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TabType =
  | "summary"
  | "transcript"
  | "notes"
  | "flashcards"
  | "quiz"
  | "mindmap"
  | "timeline"
  | "vocabulary"
  | "interview"
  | "study-guide"
  | "action-items"
  | "chat";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const NAV_ITEMS: { id: TabType; label: string; icon: any; badge?: string }[] = [
  { id: "summary", label: "Summaries", icon: FileText },
  { id: "transcript", label: "Transcript", icon: BookOpen },
  { id: "notes", label: "Structured Notes", icon: StickyNote },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Interactive Quiz", icon: HelpCircle, badge: "20 MCQs" },
  { id: "mindmap", label: "Mind Map", icon: Network },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "vocabulary", label: "Vocabulary", icon: Book },
  { id: "interview", label: "Interview Prep", icon: Briefcase },
  { id: "study-guide", label: "Study Guide", icon: Sparkles },
  { id: "action-items", label: "Action Items", icon: CheckSquare },
  { id: "chat", label: "RAG AI Chat", icon: MessageSquare, badge: "AI" },
];

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-card/60 backdrop-blur-xl border-r border-border h-full transition-all duration-300 relative z-20 shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 font-bold text-sm">
              YT
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight gradient-text">Study Studio</h2>
              <p className="text-[10px] text-muted-foreground">AI Material Suite</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            YT
          </div>
        )}

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hidden md:flex"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
