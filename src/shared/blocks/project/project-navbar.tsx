'use client';

import { ArrowLeft, BookOpen, Clapperboard } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type ProjectStep = 'story' | 'storyboard';

interface ProjectNavbarProps {
  projectName: string;
  activeStep: ProjectStep;
  onStepChange: (step: ProjectStep) => void;
}

export function ProjectNavbar({
  projectName,
  activeStep,
  onStepChange,
}: ProjectNavbarProps) {
  const steps: { key: ProjectStep; label: string; icon: React.ReactNode }[] = [
    { key: 'story', label: '故事设定', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'storyboard', label: '分镜设定', icon: <Clapperboard className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧: 返回 + 项目名 */}
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/60" />
            <h1 className="max-w-[180px] truncate text-base font-semibold tracking-tight md:max-w-[280px] lg:max-w-[400px]">
              {projectName}
            </h1>
          </div>

          {/* 中间: 步骤切换 */}
          <nav className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 shadow-inner">
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
                  <span className={cn(
                    'transition-colors',
                    activeStep === step.key ? 'text-primary' : ''
                  )}>
                    {step.icon}
                  </span>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* 右侧占位 */}
          <div className="w-[140px]" />
        </div>
      </div>

      {/* 底部渐变线 */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </header>
  );
}
