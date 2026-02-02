import { respData, respErr } from '@/shared/lib/resp';
import { findProjectById } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';

export async function GET(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return respErr('projectId is required');
    }

    const project = await findProjectById(projectId);
    if (!project) {
      return respErr('project not found');
    }

    if (project.userId !== user.id) {
      return respErr('no permission');
    }

    const response = respData(project);
    response.headers.set(
      'Cache-Control',
      'private, max-age=10, stale-while-revalidate=30'
    );
    return response;
  } catch (error: any) {
    console.log('project info failed:', error);
    return respErr(error.message || 'project info failed');
  }
}
