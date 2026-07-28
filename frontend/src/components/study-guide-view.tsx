"use client";

import { useState } from "react";
import { Sparkles, Clock, CheckSquare, BookOpen } from "lucide-react";
import type { StudyGuide } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudyGuideViewProps {
  studyGuide?: StudyGuide;
}

export function StudyGuideView({ studyGuide }: StudyGuideViewProps) {
  if (!studyGuide) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No study guide available.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Card */}
      <Card className="glass-card border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{studyGuide.title || "Complete Study Guide"}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Structured exam prep and concept mastery guide
            </p>
          </div>
          {studyGuide.estimated_study_time && (
            <Badge variant="info" className="gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. {studyGuide.estimated_study_time}</span>
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {studyGuide.overview}
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {(studyGuide.sections || (studyGuide as any).key_topics || []).map((section: any, idx: number) => (
          <Card key={idx} className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <span>{section.title || section.topic || `Module ${idx + 1}`}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {section.content || section.summary}
              </p>

              {/* Key Concepts */}
              {section.key_concepts?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Key Concepts to Master:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {section.key_concepts.map((concept, cIdx) => (
                      <Badge key={cIdx} variant="secondary" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Questions */}
              {section.review_questions?.length > 0 && (
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Section Self-Check Questions:
                  </span>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90">
                    {section.review_questions.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
