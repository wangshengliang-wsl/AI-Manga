'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';

export function StorySettingsSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`character-skeleton-${index}`}
              className="flex gap-4 rounded-2xl border border-border/50 bg-card/60 p-4"
            >
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
