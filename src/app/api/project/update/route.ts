import styles from '@/shared/styles/index.json';
import { respData, respErr } from '@/shared/lib/resp';
import {
  findProjectById,
  updateProjectById,
  UpdateProject,
} from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';

interface StyleItem {
  id: number;
}

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { projectId, name, description, aspectRatio, styleId } =
      await request.json();

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

    if (project.deletedAt) {
      return respErr('project deleted');
    }

    if (aspectRatio && !['16:9', '9:16'].includes(aspectRatio)) {
      return respErr('invalid aspectRatio');
    }

    if (styleId !== undefined) {
      const style = (styles as StyleItem[]).find((item) => item.id === styleId);
      if (!style) {
        return respErr('invalid styleId');
      }
    }

    const update: UpdateProject = {
      ...(name ? { name: String(name).trim() } : null),
      ...(description !== undefined
        ? { description: description ? String(description).trim() : null }
        : null),
      ...(aspectRatio ? { aspectRatio } : null),
      ...(styleId !== undefined ? { styleId } : null),
    };

    if (Object.keys(update).length === 0) {
      return respErr('no valid fields to update');
    }

    const updated = await updateProjectById(projectId, update);

    return respData(updated);
  } catch (error: any) {
    console.log('update project failed:', error);
    return respErr(error.message || 'update project failed');
  }
}
