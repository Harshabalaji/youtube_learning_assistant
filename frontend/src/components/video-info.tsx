"use client";

import Image from "next/image";
import { Clock, BookOpen, BarChart2, Eye, Calendar, User, ExternalLink, Sparkles } from "lucide-react";
import type { VideoMetadata } from "@/types";
import { formatDuration, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VideoInfoProps {
  video: VideoMetadata;
}

export function VideoInfo({ video }: VideoInfoProps) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Thumbnail */}
        <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0 group-hover:scale-[1.02] transition duration-300">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title || "Video thumbnail"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-mono font-medium">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="gap-1">
              <Sparkles className="w-3 h-3" /> Processed
            </Badge>
            {video.reading_level && (
              <Badge variant="warning">{video.reading_level} Level</Badge>
            )}
            {video.reading_time_minutes && (
              <Badge variant="info">~{video.reading_time_minutes} min read</Badge>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold line-clamp-2 text-foreground leading-snug">
            {video.title || "Untitled Video"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {video.channel && (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{video.channel}</span>
              </div>
            )}
            {video.view_count && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{formatNumber(video.view_count)} views</span>
              </div>
            )}
            {video.publish_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{video.publish_date}</span>
              </div>
            )}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Word Count</span>
              <p className="text-sm font-bold text-foreground">{formatNumber(video.word_count || 0)} words</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Est. Reading</span>
              <p className="text-sm font-bold text-foreground">~{video.reading_time_minutes || 0} min</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Level</span>
              <p className="text-sm font-bold text-foreground">{video.reading_level || "N/A"}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Topics</span>
              <p className="text-sm font-bold text-foreground">{video.tags?.length || 0} Auto-Tags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
