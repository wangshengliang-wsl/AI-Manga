import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getUserInfo } from '@/shared/models/user';

interface ProjectDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
}

export default async function ProjectDetailLayout({
  children,
  params,
}: ProjectDetailLayoutProps) {
  const { id, locale } = await params;
  const user = await getUserInfo();

  if (!user) {
    const callbackUrl = encodeURIComponent(`/project/${id}`);
    redirect(`/${locale}/sign-in?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
