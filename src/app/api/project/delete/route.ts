import { respErr, respOk } from '@/shared/lib/resp';
import { deleteProjectById, findProjectById } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { projectId } = await request.json();
    if (!projectId) {
      return respErr('projectId is required');
    }

    const project = await findProjectById(projectId, { includeDeleted: true });
    if (!project) {
      return respErr('project not found');
    }

    if (project.userId !== user.id) {
      return respErr('no permission');
    }

    if (project.deletedAt) {
      return respOk();
    }

    await deleteProjectById(projectId);

    return respOk();
  } catch (error: any) {
    console.log('delete project failed:', error);
    return respErr(error.message || 'delete project failed');
  }
}
