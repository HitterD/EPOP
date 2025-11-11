/**
 * Score Explanation Tooltip
 * 
 * Shows search relevance score breakdown (dev mode only)
 */

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScoreBreakdown {
  total: number;
  titleMatch?: number;
  contentMatch?: number;
  exactMatch?: number;
  fuzzyMatch?: number;
  recency?: number;
  popularity?: number;
  metadata?: number;
}

export interface ScoreExplainProps {
  score: number;
  breakdown?: ScoreBreakdown;
  showInProduction?: boolean;
  className?: string;
}

export function ScoreExplain({
  score,
  breakdown,
  showInProduction = false,
  className,
}: ScoreExplainProps) {
  // Only show in development mode unless explicitly enabled
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && !showInProduction) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'cursor-help gap-1 text-xs font-mono',
              className
            )}
          >
            <Info className="h-3 w-3" />
            {score.toFixed(2)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold text-sm">Relevance Score Breakdown</div>
            
            {breakdown ? (
              <div className="space-y-1 text-xs">
                {breakdown.titleMatch !== undefined && (
                  <ScoreItem label="Title match" value={breakdown.titleMatch} />
                )}
                {breakdown.contentMatch !== undefined && (
                  <ScoreItem label="Content match" value={breakdown.contentMatch} />
                )}
                {breakdown.exactMatch !== undefined && (
                  <ScoreItem label="Exact match" value={breakdown.exactMatch} />
                )}
                {breakdown.fuzzyMatch !== undefined && (
                  <ScoreItem label="Fuzzy match" value={breakdown.fuzzyMatch} />
                )}
                {breakdown.recency !== undefined && (
                  <ScoreItem label="Recency" value={breakdown.recency} />
                )}
                {breakdown.popularity !== undefined && (
                  <ScoreItem label="Popularity" value={breakdown.popularity} />
                )}
                {breakdown.metadata !== undefined && (
                  <ScoreItem label="Metadata" value={breakdown.metadata} />
                )}
                
                <div className="pt-2 mt-2 border-t">
                  <ScoreItem
                    label="Total Score"
                    value={breakdown.total}
                    bold
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No breakdown available
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground italic">
              Dev mode only - Hidden in production
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Score item component
 */
function ScoreItem({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  const percentage = Math.round(value * 100);
  const barWidth = Math.min(percentage, 100);

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1', bold && 'font-semibold')}>
        {label}
      </div>
      <div className="flex items-center gap-2 w-24">
        {/* Progress bar */}
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              bold ? 'bg-primary' : 'bg-muted-foreground'
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        {/* Value */}
        <div className={cn('w-10 text-right font-mono', bold && 'font-bold')}>
          {value.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate score breakdown from search result
 */
export function calculateScoreBreakdown(
  result: {
    title: string;
    content: string;
    createdAt?: Date;
    viewCount?: number;
  },
  query: string
): ScoreBreakdown {
  const queryLower = query.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const contentLower = result.content.toLowerCase();

  // Title match (0-0.4)
  const titleMatch = titleLower.includes(queryLower)
    ? 0.4
    : titleLower.split(' ').some((word) => word.includes(queryLower))
    ? 0.2
    : 0;

  // Content match (0-0.3)
  const contentMatch = contentLower.includes(queryLower)
    ? 0.3
    : contentLower.split(' ').some((word) => word.includes(queryLower))
    ? 0.15
    : 0;

  // Exact match bonus (0-0.2)
  const exactMatch =
    titleLower === queryLower || contentLower.includes(queryLower) ? 0.2 : 0;

  // Recency (0-0.15)
  const recency = result.createdAt
    ? calculateRecency(result.createdAt)
    : 0;

  // Popularity (0-0.1)
  const popularity = result.viewCount
    ? Math.min(result.viewCount / 1000, 0.1)
    : 0;

  const total = titleMatch + contentMatch + exactMatch + recency + popularity;

  return {
    total,
    titleMatch,
    contentMatch,
    exactMatch,
    recency,
    popularity,
  };
}

/**
 * Calculate recency score
 */
function calculateRecency(date: Date): number {
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return 0.15; // Today
  if (diffDays < 7) return 0.1; // This week
  if (diffDays < 30) return 0.05; // This month
  return 0; // Older
}

/**
 * Hook for score explanation
 */
export function useScoreExplain(
  result: any,
  query: string
) {
  const [breakdown, setBreakdown] = React.useState<ScoreBreakdown | null>(null);

  React.useEffect(() => {
    if (!result || !query) {
      setBreakdown(null);
      return;
    }

    // If result already has breakdown, use it
    if (result.scoreBreakdown) {
      setBreakdown(result.scoreBreakdown);
      return;
    }

    // Calculate breakdown
    const calculated = calculateScoreBreakdown(result, query);
    setBreakdown(calculated);
  }, [result, query]);

  return breakdown;
}
