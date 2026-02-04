'use client';

import { useState } from 'react';
import { ArrowLeft, BookOpen, Clapperboard, Trash2 } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
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

export type ProjectStep = 'story' | 'storyboard';

interface ProjectNavbarProps {
  projectName: string;
  activeStep: ProjectStep;
  onStepChange: (step: ProjectStep) => void;
  onDeleteProject?: () => Promise<void> | void;
  deleteDisabled?: boolean;
}

export function ProjectNavbar({
  projectName,
  activeStep,
  onStepChange,
  onDeleteProject,
  deleteDisabled,
}: ProjectNavbarProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const steps: { key: ProjectStep; label: string; icon: React.ReactNode }[] = [
    { key: 'story', label: '故事设定', icon: <BookOpen className="h-4 w-4" /> },
    {
      key: 'storyboard',
      label: '分镜设定',
      icon: <Clapperboard className="h-4 w-4" />,
    },
  ];

  const handleConfirmDelete = async () => {
    if (!onDeleteProject) return;
    try {
      setIsSubmitting(true);
      await onDeleteProject();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actions = onDeleteProject ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleteDisabled || isSubmitting}
          className="gap-2 rounded-xl"
        >
          <Trash2 className="h-4 w-4" />
          删除
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除项目</DialogTitle>
          <DialogDescription>
            删除后项目将进入回收状态，相关分镜与角色也会被移除。此操作可在后台恢复。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteDisabled || isSubmitting}
          >
            {isSubmitting ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="w-[140px]" />
  );

  return (
    <header className="border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="container">
        <div className="relative flex flex-col gap-3 py-3 md:h-16 md:py-0">
          {/* 顶部: 返回 + 项目名 + 操作 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/projects">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted h-9 w-9 rounded-xl transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="bg-border/60 h-6 w-px" />
              <h1 className="max-w-[180px] truncate text-base font-semibold tracking-tight md:max-w-[280px] lg:max-w-[400px]">
                {projectName}
              </h1>
            </div>
            {actions}
          </div>

          {/* 步骤切换 */}
          <nav className="md:absolute md:left-1/2 md:-translate-x-1/2">
            <div className="bg-muted/60 flex items-center gap-1 rounded-xl p-1 shadow-inner">
              {steps.map((step) => (
                <button
                  key={step.key}
                  onClick={() => onStepChange(step.key)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                    activeStep === step.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors',
                      activeStep === step.key ? 'text-primary' : ''
                    )}
                  >
                    {step.icon}
                  </span>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* 底部渐变线 */}
      <div className="via-border/50 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
    </header>
  );
}
