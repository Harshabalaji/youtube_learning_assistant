"use client";

import { useState } from "react";
import { Book, Search, Volume2 } from "lucide-react";
import type { VocabularyWord } from "@/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface VocabularyViewProps {
  vocabulary?: { words: VocabularyWord[] };
}

export function VocabularyView({ vocabulary }: VocabularyViewProps) {
  const [search, setSearch] = useState("");
  const words: any[] = vocabulary?.words || (vocabulary as any)?.terms || (Array.isArray(vocabulary) ? vocabulary : []);

  const filteredWords = words.filter(
    (w) =>
      (w.word || w.term || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.meaning || w.definition || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!words.length) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No vocabulary extracted for this video.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between glass-card p-4">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">
            Vocabulary ({words.length} terms)
          </h3>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Word Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWords.map((wordEntry, idx) => (
          <Card key={idx} className="glass-card hover:border-primary/40 transition">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-primary capitalize">
                  {wordEntry.word || wordEntry.term}
                </h4>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Meaning
                  </span>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {wordEntry.meaning || wordEntry.definition}
                  </p>
                </div>

                {wordEntry.example && (
                  <div className="bg-muted/40 p-3 rounded-xl border border-border/40 text-xs text-foreground/90 italic">
                    " {wordEntry.example} "
                  </div>
                )}

                {wordEntry.context && (
                  <div className="text-xs text-muted-foreground pt-1">
                    <strong>Context in video:</strong> {wordEntry.context}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
