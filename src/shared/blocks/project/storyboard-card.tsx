'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  ImageIcon,
  Play,
  Trash2,
  User,
  Video,
} from 'lucide-react';

import { Character } from '@/shared/api/character';
import { Storyboard } from '@/shared/api/storyboard';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

interface StoryboardCardProps {
  storyboard: Storyboard;
  index: number;
  aspectRatio: '16:9' | '9:16';
  characters: Character[];
  onGenerateImage?: (storyboardId: string) => void;
  onGenerateVideo?: (storyboardId: string) => void;
  onDelete?: (storyboardId: string) => void;
  deleteDisabled?: boolean;
}

export function StoryboardCard({
  storyboard,
  index,
  aspectRatio,
  characters,
  onGenerateImage,
  onGenerateVideo,
  onDelete,
  deleteDisabled,
}: StoryboardCardProps) {
  const [open, setOpen] = useState(false);
  const isVertical = aspectRatio === '9:16';
  const characterNames = characters
    .filter((c) => storyboard.characterIds?.includes(c.id))
    .map((c) => c.name);

  const imageStatus = storyboard.imageStatus || 'pending';
  const videoStatus = storyboard.videoStatus || 'pending';
  const imageGenerating = imageStatus === 'generating';
  const videoGenerating = videoStatus === 'generating';
  const imageFailed = ['failed', 'timeout'].includes(imageStatus || '');
  const videoFailed = ['failed', 'timeout'].includes(videoStatus || '');
  const canGenerateVideo =
    storyboard.imageStatus === 'ready' && !!storyboard.imageUrl;

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(storyboard.id);
    setOpen(false);
  };

  return (
    <div className="group border-border/50 from-card via-card to-card/80 hover:border-border overflow-hidden rounded-2xl border bg-gradient-to-r shadow-sm transition-all duration-300 hover:shadow-md md:max-h-[420px]">
      <div className="grid h-full grid-cols-1 md:grid-cols-3">
        <div className="border-border/40 flex flex-col border-b p-5 md:border-r md:border-b-0">
          <div className="mb-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shadow-sm">
                {index + 1}
              </span>
              <span className="text-foreground/80 text-sm font-medium">
                分镜
              </span>
            </div>
            {onDelete ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleteDisabled}
                    className="rounded-lg"
                  >
                    <Trash2 className="text-muted-foreground h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>删除分镜</DialogTitle>
                    <DialogDescription>
                      删除后该分镜将从列表移除，相关图片与视频任务也会停止。
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteDisabled}
                    >
                      确认删除
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>

          <p className="text-foreground/70 [&::-webkit-scrollbar-thumb]:bg-border line-clamp-[10] flex-1 overflow-y-auto pr-2 text-sm leading-relaxed [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full">
            {storyboard.description || ''}
          </p>

          {characterNames.length > 0 && (
            <div className="border-border/30 mt-4 flex flex-wrap gap-1.5 border-t pt-3">
              {characterNames.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="bg-muted/80 gap-1 rounded-lg px-2 py-1 text-xs font-normal"
                >
                  <User className="text-muted-foreground h-3 w-3" />
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="border-border/40 flex flex-col border-b p-5 md:border-r md:border-b-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground/80 text-sm font-medium">
                分镜图
              </span>
            </div>
            <span className="text-muted-foreground text-xs">{imageStatus}</span>
          </div>

          <div
            className={cn(
              'bg-muted/50 relative flex-1 overflow-hidden rounded-xl shadow-inner',
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
                <ImageIcon className="text-muted-foreground/40 h-8 w-8" />
                <p className="text-muted-foreground text-xs">暂无分镜图</p>
              </div>
            )}

            {imageGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  onClick={() => onGenerateImage?.(storyboard.id)}
                  className="rounded-lg"
                >
                  {imageFailed ? '重试生成' : '生成分镜图'}
                </Button>
              </div>
            )}

            {imageFailed ? (
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                生成失败
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground/80 text-sm font-medium">
                分镜视频
              </span>
            </div>
            <span className="text-muted-foreground text-xs">{videoStatus}</span>
          </div>

          <div
            className={cn(
              'bg-muted/50 relative flex-1 overflow-hidden rounded-xl shadow-inner',
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
                    <Play className="text-foreground h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <Video className="text-muted-foreground/40 h-8 w-8" />
                <p className="text-muted-foreground text-xs">暂无视频</p>
              </div>
            )}

            {videoGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  onClick={() => onGenerateVideo?.(storyboard.id)}
                  disabled={!canGenerateVideo}
                  className="rounded-lg"
                >
                  {videoFailed ? '重试生成' : '生成视频'}
                </Button>
              </div>
            )}

            {!canGenerateVideo ? (
              <div className="absolute top-2 left-2 rounded-full bg-black/40 px-2 py-1 text-xs text-white/80">
                需先生成分镜图
              </div>
            ) : null}

            {videoFailed ? (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                生成失败
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
