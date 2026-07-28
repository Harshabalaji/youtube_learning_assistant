"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Network, Copy, Check, Download, ZoomIn, ZoomOut } from "lucide-react";
import type { MindMapData } from "@/types";
import { Button } from "@/components/ui/button";

interface MindMapViewProps {
  mindmap?: MindMapData;
}

export function MindMapView({ mindmap }: MindMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      mindmap: {
        useMaxWidth: true,
      },
    });

    if (mindmap?.mermaid_code) {
      try {
        const uniqueId = `mermaid-${Date.now()}`;
        let code = mindmap.mermaid_code.trim();
        if (
          !code.startsWith("mindmap") &&
          !code.startsWith("graph") &&
          !code.startsWith("flowchart")
        ) {
          code = `mindmap\n${code}`;
        }

        mermaid
          .render(uniqueId, code)
          .then(({ svg }) => {
            setSvgContent(svg);
            setError(null);
          })
          .catch((err) => {
            console.error("Mermaid render error:", err);
            setError("Failed to render mind map diagram.");
          });
      } catch (err: any) {
        setError(err.message);
      }
    }
  }, [mindmap?.mermaid_code]);

  const handleCopyCode = () => {
    if (!mindmap?.mermaid_code) return;
    navigator.clipboard.writeText(mindmap.mermaid_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mindmap) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No mind map data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between glass-card p-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">
            {mindmap.central_topic || "Concept Mind Map"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Mermaid Code</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Render Container */}
      <div className="glass-card p-8 flex items-center justify-center min-h-[450px] overflow-x-auto custom-scrollbar">
        {error ? (
          <div className="text-center text-destructive space-y-2">
            <p className="font-semibold">{error}</p>
            <pre className="text-xs bg-muted p-4 rounded-xl text-left max-w-xl overflow-x-auto text-muted-foreground font-mono">
              {mindmap.mermaid_code}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center mermaid-svg-wrapper"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-center text-muted-foreground animate-pulse">
            Rendering diagram...
          </div>
        )}
      </div>
    </div>
  );
}
