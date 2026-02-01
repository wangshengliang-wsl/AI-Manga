'use client';

import { useState } from 'react';
import { Sparkles, Clapperboard, RefreshCw, Wand2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Character, mockStoryboards, Project, Storyboard } from './mock-data';
import { StoryboardCard } from './storyboard-card';

interface StoryboardSettingsProps {
  project: Project;
  characters: Character[];
}

export function StoryboardSettings({
  project,
  characters,
}: StoryboardSettingsProps) {
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateStoryboards = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStoryboards(mockStoryboards);
    setIsGenerating(false);
  };

  const handleEditImagePrompt = (storyboard: Storyboard) => {
    console.log('Edit image prompt for:', storyboard.id);
  };

  const handleEditVideoPrompt = (storyboard: Storyboard) => {
    console.log('Edit video prompt for:', storyboard.id);
  };

  if (storyboards.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          {/* 网格装饰 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgba(var(--border)/0.3)_50%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49%,rgba(var(--border)/0.3)_50%,transparent_51%,transparent_100%)] bg-[size:60px_60px]" />
        </div>

        <div className="relative flex flex-col items-center px-8 py-24 text-center">
          {/* 图标 */}
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-inner">
              <Clapperboard className="h-12 w-12 text-primary/70" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg">
              <Wand2 className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          {/* 标题 */}
          <h3 className="mb-3 text-2xl font-semibold tracking-tight">
            开始创建分镜
          </h3>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            AI 将根据故事大纲自动生成专业分镜脚本，包含场景描述、角色对话和画面构图建议
          </p>

          {/* 按钮 */}
          <Button
            size="lg"
            onClick={handleGenerateStoryboards}
            disabled={isGenerating}
            className="group relative gap-2 rounded-xl px-8 shadow-lg transition-all hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>AI 正在生成分镜...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span>一键出分镜</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Clapperboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">分镜列表</h3>
            <p className="text-xs text-muted-foreground">
              共 {storyboards.length} 个分镜
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateStoryboards}
          disabled={isGenerating}
          className="gap-2 rounded-xl"
        >
          {isGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              重新生成中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              重新生成
            </>
          )}
        </Button>
      </div>

      {/* 分镜列表 */}
      <div className="space-y-5">
        {storyboards.map((storyboard, index) => (
          <div
            key={storyboard.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
          >
            <StoryboardCard
              storyboard={storyboard}
              index={index}
              aspectRatio={project.aspectRatio}
              characters={characters}
              onEditImagePrompt={handleEditImagePrompt}
              onEditVideoPrompt={handleEditVideoPrompt}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
