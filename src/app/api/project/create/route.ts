import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createProject, NewProject } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';
import styles from '@/shared/styles/index.json';

interface StyleItem {
  id: number;
  name: string;
  name_cn: string;
  prompt: string;
  url: string;
}

export async function POST(request: Request) {
  try {
    const { name, description, aspectRatio, styleId } = await request.json();

    if (!name || !aspectRatio || !styleId) {
      return respErr('invalid params');
    }

    if (!['16:9', '9:16'].includes(aspectRatio)) {
      return respErr('invalid aspectRatio');
    }

    const style = (styles as StyleItem[]).find((item) => item.id === styleId);
    if (!style) {
      return respErr('invalid styleId');
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const newProject: NewProject = {
      id: getUuid(),
      userId: user.id,
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      aspectRatio,
      styleId,
      status: 'draft',
      initStatus: 'pending',
    };

    const result = await createProject(newProject);

    return respData(result);
  } catch (error: any) {
    console.log('create project failed:', error);
    return respErr(error.message || 'create project failed');
  }
}
