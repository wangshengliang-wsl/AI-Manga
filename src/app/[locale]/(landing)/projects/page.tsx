'use client';

import { useState } from 'react';
import { Plus, Sparkles, FolderOpen } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { mockProjects, Project } from '@/shared/blocks/project/mock-data';
import { CreateProjectDialog } from '@/shared/blocks/project/create-project-dialog';
import { ProjectCard } from '@/shared/blocks/project/project-card';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="space-y-8">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">共 {projects.length} 个项目</p>
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

      {projects.length === 0 ? (
        /* 空状态 */
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 px-8 py-24">
          {/* 背景装饰 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
              <Sparkles className="h-10 w-10 text-primary/70" />
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight">开始你的创作之旅</h3>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground leading-relaxed">
              创建你的第一个漫剧项目，AI 将帮助你完成从故事构思到分镜制作的全流程
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
      ) : (
        /* 项目网格 */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
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
