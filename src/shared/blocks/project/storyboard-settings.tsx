'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clapperboard, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { Character, getCharacterList } from '@/shared/api/character';
import { Project } from '@/shared/api/project';
import {
  deleteStoryboard,
  generateStoryboardImage,
  generateStoryboards,
  generateStoryboardVideo,
  getStoryboardList,
  Storyboard,
} from '@/shared/api/storyboard';
import { StoryboardCardSkeleton } from '@/shared/components/skeleton/storyboard-card-skeleton';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/lib/error';

import { StoryboardCard } from './storyboard-card';

interface StoryboardSettingsProps {
  project: Project;
}

export function StoryboardSettings({ project }: StoryboardSettingsProps) {
  const initialVisibleCount = 6;
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchStoryboards = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getStoryboardList(project.id);
      setStoryboards(list);
      setVisibleCount((prev) =>
        Math.min(Math.max(prev, initialVisibleCount), list.length)
      );
    } catch (error) {
      toast.error(getErrorMessage(error, '获取分镜失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch storyboards failed:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  const fetchCharacters = useCallback(async () => {
    try {
      const list = await getCharacterList(project.id);
      setCharacters(list);
    } catch (error) {
      toast.error(getErrorMessage(error, '获取角色失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch characters failed:', error);
      }
    }
  }, [project.id]);

  useEffect(() => {
    fetchStoryboards();
    fetchCharacters();
  }, [fetchStoryboards, fetchCharacters]);

  useEffect(() => {
    if (
      storyboards.some(
        (sb) =>
          sb.imageStatus === 'generating' || sb.videoStatus === 'generating'
      )
    ) {
      const timer = setInterval(() => fetchStoryboards(), 4000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [storyboards, fetchStoryboards]);

  const handleGenerateStoryboards = async () => {
    try {
      setIsGenerating(true);
      const list = await generateStoryboards(project.id, 5);
      setStoryboards(list);
      setVisibleCount((prev) =>
        Math.min(Math.max(prev, initialVisibleCount), list.length)
      );
      toast.success('分镜生成完成');
    } catch (error) {
      toast.error(getErrorMessage(error, '分镜生成失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('generate storyboards failed:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (storyboardId: string) => {
    try {
      await generateStoryboardImage(storyboardId);
      toast.success('分镜图生成已开始');
      setStoryboards((prev) =>
        prev.map((sb) =>
          sb.id === storyboardId ? { ...sb, imageStatus: 'generating' } : sb
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error, '分镜图生成失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('generate storyboard image failed:', error);
      }
    }
  };

  const handleGenerateVideo = async (storyboardId: string) => {
    try {
      await generateStoryboardVideo(storyboardId);
      toast.success('分镜视频生成已开始');
      setStoryboards((prev) =>
        prev.map((sb) =>
          sb.id === storyboardId ? { ...sb, videoStatus: 'generating' } : sb
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error, '分镜视频生成失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('generate storyboard video failed:', error);
      }
    }
  };

  const handleDeleteStoryboard = async (storyboardId: string) => {
    try {
      setDeletingId(storyboardId);
      await deleteStoryboard(storyboardId);
      toast.success('分镜已删除');
      setStoryboards((prev) => {
        const next = prev.filter((sb) => sb.id !== storyboardId);
        setVisibleCount((current) => Math.min(current, next.length));
        return next;
      });
    } catch (error) {
      toast.error(getErrorMessage(error, '删除分镜失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('delete storyboard failed:', error);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const hasStoryboards = storyboards.length > 0;
  const totalStoryboards = storyboards.length;
  const visibleStoryboards = useMemo(
    () => storyboards.slice(0, visibleCount),
    [storyboards, visibleCount]
  );
  const hasMore = visibleCount < storyboards.length;

  useEffect(() => {
    if (!hasMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    // Progressive rendering to keep large storyboard lists responsive.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 4, storyboards.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, storyboards.length]);

  if (loading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <StoryboardCardSkeleton key={`storyboard-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (!hasStoryboards) {
    return (
      <div className="border-border/60 from-muted/40 via-muted/20 relative overflow-hidden rounded-3xl border border-dashed bg-gradient-to-b to-transparent">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/5 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgba(var(--border)/0.3)_50%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49%,rgba(var(--border)/0.3)_50%,transparent_51%,transparent_100%)] bg-[size:60px_60px]" />
        </div>

        <div className="relative flex flex-col items-center px-8 py-24 text-center">
          <div className="relative mb-6">
            <div className="from-primary/20 via-primary/10 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br to-transparent shadow-inner">
              <Clapperboard className="text-primary/70 h-12 w-12" />
            </div>
            <div className="bg-primary absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-lg">
              <Wand2 className="text-primary-foreground h-4 w-4" />
            </div>
          </div>

          <h3 className="mb-3 text-2xl font-semibold tracking-tight">
            开始创建分镜
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
            AI
            将根据故事大纲自动生成专业分镜脚本，包含场景描述、角色对话和画面构图建议
          </p>

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
                <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Clapperboard className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">分镜列表</h3>
            <p className="text-muted-foreground text-xs">
              共 {totalStoryboards} 个分镜
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

      <div className="space-y-5">
        {visibleStoryboards.map((storyboard, index) => (
          <div
            key={storyboard.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <StoryboardCard
              storyboard={storyboard}
              index={index}
              aspectRatio={project.aspectRatio as any}
              characters={characters}
              onGenerateImage={handleGenerateImage}
              onGenerateVideo={handleGenerateVideo}
              onDelete={handleDeleteStoryboard}
              deleteDisabled={deletingId === storyboard.id}
            />
          </div>
        ))}

        {hasMore ? (
          <div ref={loadMoreRef} className="flex justify-center pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.min(prev + 4, storyboards.length)
                )
              }
            >
              加载更多分镜
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
