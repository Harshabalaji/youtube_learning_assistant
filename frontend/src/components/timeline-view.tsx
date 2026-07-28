"use client";

import { Clock, Calendar } from "lucide-react";
import type { TimelineEvent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineViewProps {
  timeline?: { events: TimelineEvent[] };
}

export function TimelineView({ timeline }: TimelineViewProps) {
  const events = timeline?.events || (timeline as any)?.timeline || (Array.isArray(timeline) ? timeline : []);

  if (!events.length) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No timeline events available.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="relative border-l-2 border-primary/30 pl-6 ml-4 space-y-8 py-2">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md group-hover:scale-125 transition" />

            <Card className="glass-card">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time || event.timestamp || "00:00"}
                  </span>
                  <h4 className="font-bold text-base text-foreground truncate">
                    {event.title || event.event || `Event #${idx + 1}`}
                  </h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
