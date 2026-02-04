import { respData, respErr } from '@/shared/lib/resp';
import { findProjectById } from '@/shared/models/project';
import {
  findStoryboardById,
  UpdateStoryboard,
  updateStoryboardById,
} from '@/shared/models/storyboard';
import { getUserInfo } from '@/shared/models/user';

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const {
      storyboardId,
      description,
      characterIds,
      imagePrompt,
      videoPrompt,
      sortOrder,
    } = await request.json();

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

    const update: UpdateStoryboard = {
      ...(description !== undefined
        ? { description: description ? String(description).trim() : null }
        : null),
      ...(characterIds !== undefined ? { characterIds } : null),
      ...(imagePrompt !== undefined
        ? { imagePrompt: imagePrompt ? String(imagePrompt).trim() : null }
        : null),
      ...(videoPrompt !== undefined
        ? { videoPrompt: videoPrompt ? String(videoPrompt).trim() : null }
        : null),
      ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : null),
    };

    if (Object.keys(update).length === 0) {
      return respErr('no valid fields to update');
    }

    const updated = await updateStoryboardById(storyboardId, update);

    return respData(updated);
  } catch (error: any) {
    console.log('update storyboard failed:', error);
    return respErr(error.message || 'update storyboard failed');
  }
}
