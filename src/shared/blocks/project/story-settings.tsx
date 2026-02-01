'use client';

import Image from 'next/image';
import { ImageIcon, Users, Edit3, Sparkles } from 'lucide-react';

import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';

import { Character, Project } from './mock-data';

interface StorySettingsProps {
  project: Project;
  outline: string;
  onOutlineChange: (outline: string) => void;
  characters: Character[];
}

export function StorySettings({
  project,
  outline,
  onOutlineChange,
  characters,
}: StorySettingsProps) {
  const isVertical = project.aspectRatio === '9:16';

  return (
    <div className="space-y-10">
      {/* 上部: 封面 + 大纲 */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 封面图 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">封面图</h3>
          </div>

          <div className="group relative">
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 shadow-sm transition-all duration-300 hover:shadow-lg',
                isVertical ? 'aspect-[9/16] max-h-[480px]' : 'aspect-video'
              )}
            >
              <Image
                src={project.coverUrl}
                alt={project.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* 悬浮编辑按钮 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                <button className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-black shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                  <Edit3 className="h-4 w-4" />
                  更换封面
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 故事大纲 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">故事大纲</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {outline.length} 字
            </span>
          </div>

          <Textarea
            value={outline}
            onChange={(e) => onOutlineChange(e.target.value)}
            placeholder="在这里描述你的故事背景、主要人物、故事脉络..."
            className={cn(
              'resize-none rounded-2xl border-border/50 bg-muted/30 p-4 text-sm leading-relaxed transition-all focus:bg-background focus:shadow-sm',
              isVertical ? 'min-h-[480px]' : 'min-h-[260px]'
            )}
          />
        </div>
      </div>

      {/* 下部: 角色列表 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">故事角色</h3>
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {characters.length}
            </span>
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-muted/30 to-transparent px-6 py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/80">
                <Users className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">
                暂无角色，AI 会根据故事大纲自动生成角色
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 p-1 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex gap-4 rounded-xl bg-background/50 p-4">
                  {/* 角色头像 */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  {/* 角色信息 */}
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <h4 className="truncate font-semibold tracking-tight">
                      {character.name}
                    </h4>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {character.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
