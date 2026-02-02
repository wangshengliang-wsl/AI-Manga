'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';

export function StoryboardCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60">
      <div className="grid grid-cols-3">
        <div className="space-y-3 border-r border-border/40 p-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="space-y-3 border-r border-border/40 p-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
        <div className="space-y-3 p-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
