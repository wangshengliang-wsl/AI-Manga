'use client';

import Image from 'next/image';
import { Clock, Film } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Project } from '@/shared/api/project';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? '刚刚' : `${diffMinutes} 分钟前`;
    }
    return `${diffHours} 小时前`;
  }
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabelMap: Record<string, string> = {
    draft: '草稿',
    initializing: '初始化中',
    ready: '可用',
    archived: '已归档',
  };
  const statusLabel = statusLabelMap[project.status] || project.status;

  return (
    <Link href={`/project/${project.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm transition-all duration-500 ease-out hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* 封面图区域 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted/30 text-xs text-muted-foreground">
              暂无封面
            </div>
          )}
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* 画幅比标签 */}
          <div className="absolute right-3 top-3">
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all',
              'bg-black/40 text-white/90 border border-white/10',
              'group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary'
            )}>
              <Film className="h-3 w-3" />
              <span>{project.aspectRatio}</span>
            </div>
          </div>

          <div className="absolute left-3 top-3">
            <div className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
              {statusLabel}
            </div>
          </div>
        </div>

        {/* 信息区域 */}
        <div className="relative p-4">
          {/* 装饰性顶部边框 */}
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <h3 className="truncate text-base font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-foreground">
            {project.name}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>

        {/* 悬浮时的光晕效果 */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        </div>
      </div>
    </Link>
  );
}
