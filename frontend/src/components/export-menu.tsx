"use client";

import { useState } from "react";
import { Download, FileText, FileCode, FileSpreadsheet, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExportUrl } from "@/lib/api";

interface ExportMenuProps {
  videoId: string;
}

export function ExportMenu({ videoId }: ExportMenuProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (format: "pdf" | "docx" | "markdown") => {
    setDownloading(format);
    const url = getExportUrl(videoId, format);

    // Trigger file download
    const link = document.createElement("a");
    link.href = url;
    link.download = `study_material_${videoId}.${format === "markdown" ? "md" : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={downloading === "pdf"}
        className="gap-1.5 text-xs rounded-xl"
      >
        {downloading === "pdf" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-rose-500" />
        )}
        <span>PDF</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("docx")}
        disabled={downloading === "docx"}
        className="gap-1.5 text-xs rounded-xl"
      >
        {downloading === "docx" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
        )}
        <span>DOCX</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("markdown")}
        disabled={downloading === "markdown"}
        className="gap-1.5 text-xs rounded-xl"
      >
        {downloading === "markdown" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileCode className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <span>Markdown</span>
      </Button>
    </div>
  );
}
