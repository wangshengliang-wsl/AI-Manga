'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { FileQuestion } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';

import {
  getProjectById,
  mockCharacters,
  Project,
} from './mock-data';
import { ProjectNavbar, ProjectStep } from './project-navbar';
import { StorySettings } from './story-settings';
import { StoryboardSettings } from './storyboard-settings';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [activeStep, setActiveStep] = useState<ProjectStep>('story');

  const project = useMemo<Project | undefined>(() => {
    const found = getProjectById(projectId);
    if (found) return found;

    if (projectId.startsWith('proj-')) {
      return {
        id: projectId,
        name: '新项目',
        coverUrl: 'https://picsum.photos/seed/new/800/450',
        aspectRatio: '16:9',
        styleId: 1,
        description: '',
        updatedAt: new Date().toISOString(),
      };
    }

    return undefined;
  }, [projectId]);

  const [outline, setOutline] = useState(project?.description || '');

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">项目不存在</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              该项目可能已被删除或链接无效
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="mt-2 rounded-xl">
              返回项目列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <ProjectNavbar
        projectName={project.name}
        activeStep={activeStep}
        onStepChange={setActiveStep}
      />

      <main className="container max-w-7xl py-8 lg:py-10">
        {activeStep === 'story' ? (
          <StorySettings
            project={project}
            outline={outline}
            onOutlineChange={setOutline}
            characters={mockCharacters}
          />
        ) : (
          <StoryboardSettings project={project} characters={mockCharacters} />
        )}
      </main>
    </div>
  );
}
