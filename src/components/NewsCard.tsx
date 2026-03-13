"use client";

import { useState } from "react";
import type { NewsItem } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Bookmark,
  MessageCircle,
  ChevronDown,
  Link2,
  Share2,
} from "lucide-react";

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="relative pl-20 pb-8 group hover:bg-muted/30 transition-colors -mx-4 px-4 rounded-lg">
      {/* Timeline dot */}
      <div className="absolute left-[52px] top-1.5 w-2 h-2 rounded-full bg-border z-10" />

      {/* Timeline line */}
      <div className="absolute left-[55px] top-4 bottom-0 w-px bg-border" />

      {/* Timestamp */}
      <div className="absolute left-0 top-0 w-14 text-right pr-4">
        <span
          className={`text-sm font-medium ${
            item.isHighlighted
              ? "text-[#dd6231] bg-[#dd6231]/10 px-2 py-0.5 rounded-md"
              : "text-muted-foreground"
          }`}
        >
          {item.timestamp}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3
          className={`text-[15px] font-semibold leading-snug cursor-pointer hover:underline decoration-1 underline-offset-2 ${
            item.isHighlighted ? "text-[#dd6231]" : "text-foreground"
          }`}
        >
          {item.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm text-muted-foreground leading-relaxed ${
            !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          {item.description}
        </p>

        {/* Tag and Quick Order */}
        {item.tag && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-7 px-2.5 gap-1.5 bg-muted/80 hover:bg-muted border-0 rounded-md"
              >
                <img
                  src={item.tag.icon}
                  alt={item.tag.name}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs font-medium text-foreground">{item.tag.name}</span>
              </Badge>
            </div>

            {item.hasQuickOrder && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[#52c68f] text-[#52c68f] hover:bg-[#52c68f]/10 rounded-md"
              >
                <img
                  src={item.tag?.icon}
                  alt=""
                  className="w-3.5 h-3.5 mr-1.5 rounded-full"
                />
                Quick Order
              </Button>
            )}
          </div>
        )}

        {/* Metrics and Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-5 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-xs hover:text-foreground cursor-pointer transition-colors">
              <Flame className="w-4 h-4" />
              {item.metrics.views}
            </span>
            <span className="flex items-center gap-1.5 text-xs hover:text-foreground cursor-pointer transition-colors">
              <Bookmark className="w-4 h-4" />
              {item.metrics.bookmarks}
            </span>
            <span className="flex items-center gap-1.5 text-xs hover:text-foreground cursor-pointer transition-colors">
              <MessageCircle className="w-4 h-4" />
              {item.metrics.comments}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown
                  className={`w-4 h-4 mr-1 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
