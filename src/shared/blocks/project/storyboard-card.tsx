'use client';

import Image from 'next/image';
import { Edit3, Play, ImageIcon, Video, User } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

import { Character, Storyboard } from './mock-data';

interface StoryboardCardProps {
  storyboard: Storyboard;
  index: number;
  aspectRatio: '16:9' | '9:16';
  characters: Character[];
  onEditImagePrompt?: (storyboard: Storyboard) => void;
  onEditVideoPrompt?: (storyboard: Storyboard) => void;
}

export function StoryboardCard({
  storyboard,
  index,
  aspectRatio,
  characters,
  onEditImagePrompt,
  onEditVideoPrompt,
}: StoryboardCardProps) {
  const isVertical = aspectRatio === '9:16';
  const characterNames = characters
    .filter((c) => storyboard.characterIds.includes(c.id))
    .map((c) => c.name);

  return (
    <div className="group max-h-[420px] overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card via-card to-card/80 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
      <div className="grid h-full grid-cols-3">
        {/* 左栏: 文本 + 角色标签 */}
        <div className="flex flex-col border-r border-border/40 p-5">
          {/* 序号标题 */}
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-foreground/80">分镜</span>
          </div>

          {/* 文本内容 */}
          <p className="flex-1 overflow-y-auto text-sm leading-relaxed text-foreground/70 line-clamp-[10] pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            {storyboard.text}
          </p>

          {/* 角色标签 */}
          {characterNames.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/30 pt-3">
              {characterNames.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="gap-1 rounded-lg bg-muted/80 px-2 py-1 text-xs font-normal"
                >
                  <User className="h-3 w-3 text-muted-foreground" />
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 中栏: 分镜图 */}
        <div className="flex flex-col border-r border-border/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground/80">分镜图</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onEditImagePrompt?.(storyboard)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div
            className={cn(
              'relative flex-1 overflow-hidden rounded-xl bg-muted/50 shadow-inner',
              isVertical ? 'aspect-[9/16]' : 'aspect-video'
            )}
          >
            {storyboard.imageUrl ? (
              <Image
                src={storyboard.imageUrl}
                alt={`分镜 ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">点击生成图片</p>
              </div>
            )}
          </div>
        </div>

        {/* 右栏: 分镜视频 */}
        <div className="flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground/80">分镜视频</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onEditVideoPrompt?.(storyboard)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div
            className={cn(
              'relative flex-1 overflow-hidden rounded-xl bg-muted/50 shadow-inner',
              isVertical ? 'aspect-[9/16]' : 'aspect-video'
            )}
          >
            {storyboard.videoUrl ? (
              <div className="relative h-full w-full">
                <video
                  src={storyboard.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-11 w-11 rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <Play className="h-5 w-5 text-foreground" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <Video className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">点击生成视频</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
