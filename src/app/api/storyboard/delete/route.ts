import { respErr, respOk } from '@/shared/lib/resp';
import { findProjectById } from '@/shared/models/project';
import {
  deleteStoryboardById,
  findStoryboardById,
} from '@/shared/models/storyboard';
import { getUserInfo } from '@/shared/models/user';

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { storyboardId } = await request.json();
    if (!storyboardId) {
      return respErr('storyboardId is required');
    }

    const storyboard = await findStoryboardById(storyboardId);
    if (!storyboard) {
      return respErr('storyboard not found');
    }

    if (storyboard.userId !== user.id) {
      return respErr('no permission');
    }

    const project = await findProjectById(storyboard.projectId);
    if (!project || project.userId !== user.id) {
      return respErr('no permission');
    }

    await deleteStoryboardById(storyboardId);

    return respOk();
  } catch (error: any) {
    console.log('delete storyboard failed:', error);
    return respErr(error.message || 'delete storyboard failed');
  }
}
