'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FolderOpen, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { getProjectList, Project } from '@/shared/api/project';
import { CreateProjectDialog } from '@/shared/blocks/project/create-project-dialog';
import { ProjectCard } from '@/shared/blocks/project/project-card';
import { ProjectCardSkeleton } from '@/shared/components/skeleton/project-card-skeleton';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/lib/error';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setTotal((prev) => prev + 1);
  };

  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjectList();
        if (!active) return;
        setProjects(data.list || []);
        setTotal(data.total || 0);
        setVisibleCount((prev) =>
          Math.min(Math.max(prev, 12), data.list?.length || 0)
        );
      } catch (error) {
        toast.error(getErrorMessage(error, '获取项目列表失败'));
        if (process.env.NODE_ENV !== 'production') {
          console.log('fetch projects failed:', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      active = false;
    };
  }, []);

  const visibleProjects = useMemo(
    () => projects.slice(0, visibleCount),
    [projects, visibleCount]
  );
  const hasMore = visibleCount < projects.length;

  useEffect(() => {
    if (!hasMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    // Incremental rendering keeps large grids responsive without extra deps.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 8, projects.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, projects.length]);

  return (
    <div className="space-y-8">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <FolderOpen className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              共 {loading ? '-' : total} 个项目
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="group relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>新增项目</span>
          </span>
        </Button>
      </div>

      {!loading && projects.length === 0 ? (
        /* 空状态 */
        <div className="border-border/60 from-muted/30 to-muted/10 relative overflow-hidden rounded-3xl border border-dashed bg-gradient-to-b px-8 py-24">
          {/* 背景装饰 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="bg-primary/5 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl" />
            <div className="bg-primary/5 absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="from-primary/20 to-primary/5 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner">
              <Sparkles className="text-primary/70 h-10 w-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight">
              开始你的创作之旅
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
              创建你的第一个漫剧项目，AI
              将帮助你完成从故事构思到分镜制作的全流程
            </p>
            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="group gap-2 rounded-xl px-8"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              创建第一个项目
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProjectCardSkeleton key={`project-skeleton-${index}`} />
          ))}
        </div>
      ) : (
        /* 项目网格 */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <ProjectCard project={project} />
            </div>
          ))}

          {hasMore ? (
            <div
              ref={loadMoreRef}
              className="col-span-full flex justify-center"
            >
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + 8, projects.length))
                }
              >
                加载更多项目
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
