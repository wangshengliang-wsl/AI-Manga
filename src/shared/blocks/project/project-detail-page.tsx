'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Project, deleteProject, getProjectInfo } from '@/shared/api/project';
import { ProjectNavbar, ProjectStep } from './project-navbar';
import { StorySettings } from './story-settings';
import { StoryboardSettings } from './storyboard-settings';
import { StorySettingsSkeleton } from '@/shared/components/skeleton/story-settings-skeleton';
import { StoryboardCardSkeleton } from '@/shared/components/skeleton/storyboard-card-skeleton';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/error';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [activeStep, setActiveStep] = useState<ProjectStep>('story');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectInfo(projectId);
        if (!active) return;
        setProject(data);
      } catch (error) {
        if (!active) return;
        setNotFound(true);
        if (process.env.NODE_ENV !== 'production') {
          console.log('fetch project failed:', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProject();
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      setIsDeleting(true);
      await deleteProject(project.id);
      toast.success('项目已删除');
      router.push('/projects');
    } catch (error) {
      toast.error(getErrorMessage(error, '删除项目失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('delete project failed:', error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (notFound && !loading) {
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
        projectName={project?.name || '加载中...'}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onDeleteProject={handleDeleteProject}
        deleteDisabled={!project || isDeleting}
      />

      <main className="container max-w-7xl py-8 lg:py-10">
        {loading || !project ? (
          activeStep === 'story' ? (
            <StorySettingsSkeleton />
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <StoryboardCardSkeleton key={`storyboard-loading-${index}`} />
              ))}
            </div>
          )
        ) : activeStep === 'story' ? (
          <StorySettings
            project={project}
            onProjectUpdated={(next) => setProject(next)}
          />
        ) : (
          <StoryboardSettings project={project} />
        )}
      </main>
    </div>
  );
}
