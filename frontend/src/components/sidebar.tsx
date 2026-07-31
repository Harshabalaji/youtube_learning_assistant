"use client";

import {
  FileText, BookOpen, StickyNote, Layers, HelpCircle, Network,
  MessageSquare, Clock, Briefcase, Book, CheckSquare, Sparkles,
  ChevronLeft, ChevronRight, Youtube,
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

// ── Nav item groups ────────────────────────────────────────────────
const NAV_GROUPS: {
  label: string;
  items: {
    id: TabType;
    label: string;
    icon: any;
    badge?: string;
    color: string;
    activeColor: string;
    activeBg: string;
  }[];
}[] = [
  {
    label: "Overview",
    items: [
      { id: "summary",    label: "Summaries",       icon: FileText,    color: "text-violet-400",  activeColor: "text-violet-400",  activeBg: "bg-violet-500/10 border-violet-500/30" },
      { id: "transcript", label: "Transcript",       icon: BookOpen,    color: "text-indigo-400",  activeColor: "text-indigo-400",  activeBg: "bg-indigo-500/10 border-indigo-500/30" },
      { id: "notes",      label: "Structured Notes", icon: StickyNote,  color: "text-blue-400",    activeColor: "text-blue-400",    activeBg: "bg-blue-500/10 border-blue-500/30" },
    ],
  },
  {
    label: "Study Tools",
    items: [
      { id: "flashcards",   label: "Flashcards",       icon: Layers,      color: "text-cyan-400",    activeColor: "text-cyan-400",    activeBg: "bg-cyan-500/10 border-cyan-500/30" },
      { id: "quiz",         label: "Interactive Quiz",  icon: HelpCircle,  color: "text-emerald-400", activeColor: "text-emerald-400", activeBg: "bg-emerald-500/10 border-emerald-500/30", badge: "20 MCQs" },
      { id: "mindmap",      label: "Mind Map",          icon: Network,     color: "text-amber-400",   activeColor: "text-amber-400",   activeBg: "bg-amber-500/10 border-amber-500/30" },
      { id: "timeline",     label: "Timeline",          icon: Clock,       color: "text-rose-400",    activeColor: "text-rose-400",    activeBg: "bg-rose-500/10 border-rose-500/30" },
      { id: "vocabulary",   label: "Vocabulary",        icon: Book,        color: "text-pink-400",    activeColor: "text-pink-400",    activeBg: "bg-pink-500/10 border-pink-500/30" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { id: "interview",    label: "Interview Prep",    icon: Briefcase,   color: "text-orange-400",  activeColor: "text-orange-400",  activeBg: "bg-orange-500/10 border-orange-500/30" },
      { id: "study-guide",  label: "Study Guide",       icon: Sparkles,    color: "text-purple-400",  activeColor: "text-purple-400",  activeBg: "bg-purple-500/10 border-purple-500/30" },
      { id: "action-items", label: "Action Items",      icon: CheckSquare, color: "text-teal-400",    activeColor: "text-teal-400",    activeBg: "bg-teal-500/10 border-teal-500/30" },
      { id: "chat",         label: "RAG AI Chat",       icon: MessageSquare, color: "text-blue-400", activeColor: "text-blue-400",    activeBg: "bg-blue-500/10 border-blue-500/30", badge: "AI" },
    ],
  },
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
        "flex flex-col bg-card/70 backdrop-blur-xl border-r border-border/50 h-full transition-all duration-300 relative z-20 shrink-0",
        collapsed ? "w-[66px]" : "w-60"
      )}
    >
      {/* ── Sidebar Header ─────────────────────────────── */}
      <div className="p-3.5 border-b border-border/40 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-purple-500/30 shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm leading-tight gradient-text truncate font-display">Study Studio</h2>
              <p className="text-[10px] text-muted-foreground">AI Material Suite</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-purple-500/30">
            <Youtube className="w-4 h-4" />
          </div>
        )}

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hidden md:flex shrink-0 ml-1"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </Button>
        )}
      </div>

      {/* ── Nav Items ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-1" : ""}>
            {/* Group label — only when expanded */}
            {!collapsed && (
              <div className="section-label">{group.label}</div>
            )}
            {/* Divider for collapsed mode */}
            {collapsed && gi > 0 && (
              <div className="my-2 mx-2 h-px bg-border/40" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative sidebar-tooltip-group">
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative border",
                        isActive
                          ? `${item.activeBg} ${item.activeColor} border-current/30`
                          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground border-transparent"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Colored icon */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                          isActive ? "bg-current/10" : "group-hover:scale-105"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5 transition-colors",
                            isActive ? "text-current" : item.color
                          )}
                        />
                      </div>

                      {!collapsed && (
                        <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                      )}

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                            isActive
                              ? "bg-current/15 text-current"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-current" />
                      )}
                    </button>

                    {/* Tooltip shown on hover when collapsed */}
                    {collapsed && (
                      <div className="sidebar-tooltip">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sidebar Footer ─────────────────────────────── */}
      {!collapsed && (
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/50">
            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>LangChain · ChromaDB</span>
          </div>
        </div>
      )}
    </aside>
  );
}
