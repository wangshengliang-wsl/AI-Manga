import { respData, respErr } from '@/shared/lib/resp';
import { findProjectById } from '@/shared/models/project';
import { findStoryboardsByProjectId } from '@/shared/models/storyboard';
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

    const storyboards = await findStoryboardsByProjectId(projectId);

    const response = respData(storyboards);
    response.headers.set(
      'Cache-Control',
      'private, max-age=10, stale-while-revalidate=30'
    );
    return response;
  } catch (error: any) {
    console.log('list storyboards failed:', error);
    return respErr(error.message || 'list storyboards failed');
  }
}
