'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Edit3, ImageIcon, RefreshCw, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';

import {
  Character,
  getCharacterList,
  regenerateCharacterImage,
} from '@/shared/api/character';
import {
  getInitStatus,
  getProjectInfo,
  initStory,
  Project,
} from '@/shared/api/project';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { usePollStatus } from '@/shared/hooks/use-poll-status';
import { getErrorMessage } from '@/shared/lib/error';
import { cn } from '@/shared/lib/utils';

interface StorySettingsProps {
  project: Project;
  onProjectUpdated?: (project: Project) => void;
}

export function StorySettings({
  project,
  onProjectUpdated,
}: StorySettingsProps) {
  const [outline, setOutline] = useState(project.storyOutline || '');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [initStatus, setInitStatus] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(
    new Set()
  );

  const isVertical = project.aspectRatio === '9:16';
  const showInitButton =
    project.status !== 'initializing' &&
    (!project.storyOutline || project.initStatus === 'failed');

  const {
    data: pollData,
    start: startPoll,
    stop: stopPoll,
    pollOnce,
  } = usePollStatus(() => getInitStatus(project.id), {
    interval: 3000,
    stopCondition: (data) => ['completed', 'failed'].includes(data?.initStatus),
    onError: (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('poll init status failed:', error);
      }
    },
  });

  const refreshProject = useCallback(async () => {
    try {
      const updated = await getProjectInfo(project.id);
      onProjectUpdated?.(updated);
      setOutline(updated.storyOutline || '');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('refresh project failed:', error);
      }
    }
  }, [onProjectUpdated, project.id]);

  const refreshCharacters = useCallback(async () => {
    try {
      setLoadingCharacters(true);
      const list = await getCharacterList(project.id);
      setCharacters(list);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch characters failed:', error);
      }
    } finally {
      setLoadingCharacters(false);
    }
  }, [project.id]);

  useEffect(() => {
    setOutline(project.storyOutline || '');
  }, [project.storyOutline]);

  useEffect(() => {
    refreshCharacters();
  }, [refreshCharacters]);

  useEffect(() => {
    if (project.status === 'initializing') {
      startPoll();
    }
    return () => stopPoll();
  }, [project.status, startPoll, stopPoll]);

  useEffect(() => {
    if (pollData) {
      setInitStatus(pollData);
      if (pollData?.characters) {
        setCharacters((prev) => {
          const merged = pollData.characters.map((c: any) => {
            const existing = prev.find((item) => item.id === c.id);
            return { ...existing, ...c } as Character;
          });
          return merged.length ? merged : prev;
        });
      }
      if (['completed', 'failed'].includes(pollData?.initStatus)) {
        setIsInitializing(false);
        refreshProject();
        refreshCharacters();
      }
    }
  }, [pollData, refreshProject, refreshCharacters]);

  useEffect(() => {
    if (characters.some((c) => c.status === 'generating')) {
      const timer = setInterval(() => refreshCharacters(), 4000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [characters, refreshCharacters]);

  const handleInitStory = async () => {
    try {
      setIsInitializing(true);
      await initStory(project.id);
      toast.success('初始化已开始');
      startPoll();
    } catch (error) {
      toast.error(getErrorMessage(error, '初始化失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('init story failed:', error);
      }
      setIsInitializing(false);
    }
  };

  const handleRegenerateImage = async (characterId: string) => {
    try {
      setRegeneratingIds((prev) => new Set(prev).add(characterId));
      await regenerateCharacterImage(characterId);
      toast.success('角色图片生成已开始');
      setCharacters((prev) =>
        prev.map((character) =>
          character.id === characterId
            ? { ...character, status: 'generating' }
            : character
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error, '重生成失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('regenerate image failed:', error);
      }
    } finally {
      setRegeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(characterId);
        return next;
      });
    }
  };

  const initProgress = useMemo(() => {
    if (!initStatus) return null;
    return {
      stage: initStatus.initStatus,
      coverStatus: initStatus.coverStatus,
      characterProgress: initStatus.characterProgress,
    };
  }, [initStatus]);

  return (
    <div className="space-y-10">
      {showInitButton ? (
        <div className="border-border/60 from-muted/30 relative overflow-hidden rounded-3xl border border-dashed bg-gradient-to-b to-transparent px-6 py-16 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Sparkles className="text-primary h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              一键初始化故事
            </h3>
            <p className="text-muted-foreground text-sm">
              AI 将为你生成故事大纲、角色设定和封面图
            </p>
            <Button
              onClick={handleInitStory}
              disabled={isInitializing}
              className="mt-2 rounded-xl px-6"
            >
              {isInitializing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  初始化中...
                </span>
              ) : (
                '开始初始化'
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {project.status === 'initializing' || isInitializing ? (
        <div className="border-border/50 bg-muted/30 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">初始化进度</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {initProgress?.stage || project.initStatus}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pollOnce()}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
          {initProgress?.characterProgress && (
            <p className="text-muted-foreground mt-3 text-xs">
              角色图生成进度：{initProgress.characterProgress.ready}/
              {initProgress.characterProgress.total}
            </p>
          )}
          {initProgress?.coverStatus && (
            <p className="text-muted-foreground mt-1 text-xs">
              封面状态：{initProgress.coverStatus}
            </p>
          )}
          {project.initError && (
            <p className="text-destructive mt-2 text-xs">{project.initError}</p>
          )}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <ImageIcon className="text-primary h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">封面图</h3>
          </div>

          <div className="group relative">
            <div
              className={cn(
                'border-border/50 bg-muted/30 relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg',
                isVertical ? 'aspect-[9/16] max-h-[480px]' : 'aspect-video'
              )}
            >
              {project.coverImageUrl ? (
                <Image
                  src={project.coverImageUrl}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  暂无封面
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                <button className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-black shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                  <Edit3 className="h-4 w-4" />
                  更换封面
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="text-primary h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                故事大纲
              </h3>
            </div>
            <span className="text-muted-foreground text-xs">
              {outline.length} 字
            </span>
          </div>

          <Textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="在这里描述你的故事背景、主要人物、故事脉络..."
            className={cn(
              'border-border/50 bg-muted/30 focus:bg-background resize-none rounded-2xl p-4 text-sm leading-relaxed transition-all focus:shadow-sm',
              isVertical ? 'min-h-[480px]' : 'min-h-[260px]'
            )}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Users className="text-primary h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">故事角色</h3>
            <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
              {characters.length}
            </span>
          </div>
        </div>

        {loadingCharacters ? (
          <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-2xl border border-dashed px-6 py-10 text-center text-sm">
            角色加载中...
          </div>
        ) : characters.length === 0 ? (
          <div className="border-border/60 from-muted/30 relative overflow-hidden rounded-2xl border border-dashed bg-gradient-to-b to-transparent px-6 py-16">
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted/80 mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                <Users className="text-muted-foreground/60 h-7 w-7" />
              </div>
              <p className="text-muted-foreground text-sm">
                暂无角色，AI 会根据故事大纲自动生成角色
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="group border-border/50 from-card to-card/50 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-1 shadow-sm transition-all duration-300 hover:shadow-md"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <div className="bg-background/50 flex gap-4 rounded-xl p-4">
                  <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-inner">
                    {character.imageUrl ? (
                      <Image
                        src={character.imageUrl}
                        alt={character.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                        暂无图片
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h4 className="truncate font-semibold tracking-tight">
                      {character.name}
                    </h4>
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                      {character.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {character.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerateImage(character.id)}
                        disabled={regeneratingIds.has(character.id)}
                        className="h-7 rounded-lg px-2 text-xs"
                      >
                        {regeneratingIds.has(character.id)
                          ? '处理中...'
                          : '重生成'}
                      </Button>
                    </div>
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
