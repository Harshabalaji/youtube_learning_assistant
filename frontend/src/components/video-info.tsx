"use client";

import Image from "next/image";
import {
  Clock, Eye, Calendar, User, ExternalLink, Sparkles,
  BookOpen, BarChart2, Tags, PlayCircle,
} from "lucide-react";
import type { VideoMetadata } from "@/types";
import { formatDuration, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VideoInfoProps {
  video: VideoMetadata;
}

export function VideoInfo({ video }: VideoInfoProps) {
  return (
    <div className="glass-card-hover p-5 relative overflow-hidden animate-fade-up">
      {/* Ambient gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/8 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* ── Thumbnail ──────────────────────────────── */}
        <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden shadow-xl border border-white/10 shrink-0 group">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title || "Video thumbnail"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full gradient-bg flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white/60" />
            </div>
          )}

          {/* Play overlay on hover */}
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
              <PlayCircle className="w-7 h-7 text-gray-900 fill-gray-900" />
            </div>
          </a>

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg font-mono font-bold shadow-lg">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* ── Info Panel ─────────────────────────────── */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="gap-1.5 text-xs">
              <Sparkles className="w-3 h-3" />
              Analyzed
            </Badge>
            {video.reading_level && (
              <Badge variant="warning" className="text-xs">{video.reading_level} Level</Badge>
            )}
            {video.reading_time_minutes && (
              <Badge variant="info" className="text-xs gap-1">
                <Clock className="w-2.5 h-2.5" />
                ~{video.reading_time_minutes} min read
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-black line-clamp-2 text-foreground leading-snug font-display">
            {video.title || "Untitled Video"}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {video.channel && (
              <div className="flex items-center gap-1.5 font-semibold text-foreground/90">
                <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center shadow-sm shrink-0">
                  <User className="w-2.5 h-2.5 text-white" />
                </div>
                <span>{video.channel}</span>
              </div>
            )}
            {video.view_count && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-primary/60" />
                <span>{formatNumber(video.view_count)} views</span>
              </div>
            )}
            {video.publish_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                <span>{video.publish_date}</span>
              </div>
            )}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Watch on YouTube</span>
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              {
                label: "Words",
                value: formatNumber(video.word_count || 0),
                icon: BookOpen,
                color: "feature-violet",
              },
              {
                label: "Reading",
                value: `~${video.reading_time_minutes || 0}m`,
                icon: Clock,
                color: "feature-blue",
              },
              {
                label: "Level",
                value: video.reading_level || "N/A",
                icon: BarChart2,
                color: "feature-emerald",
              },
              {
                label: "Topics",
                value: `${video.tags?.length || 0} tags`,
                icon: Tags,
                color: "feature-amber",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`rounded-xl p-3 border animate-fade-up bg-muted/30 border-border/40 hover:border-primary/25 hover:bg-primary/5 transition-all duration-200 cursor-default delay-${(i + 1) * 100}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-sm font-black text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {video.tags.slice(0, 8).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-primary/8 text-primary/80 border border-primary/15 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
