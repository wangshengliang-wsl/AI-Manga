import { respData, respErr } from '@/shared/lib/resp';
import { findCharactersByProjectId } from '@/shared/models/character';
import { findGenerationTasksByTargetId } from '@/shared/models/generation_task';
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

    const [characters, coverTasks] = await Promise.all([
      findCharactersByProjectId(projectId),
      findGenerationTasksByTargetId('cover', projectId),
    ]);

    const latestCoverTask = coverTasks.length
      ? coverTasks[coverTasks.length - 1]
      : null;

    let coverStatus = 'pending';
    if (project.coverImageUrl) {
      coverStatus = 'ready';
    } else if (
      latestCoverTask?.status === 'processing' ||
      latestCoverTask?.status === 'pending'
    ) {
      coverStatus = 'generating';
    } else if (latestCoverTask?.status === 'failed') {
      coverStatus = 'failed';
    } else if (latestCoverTask?.status === 'timeout') {
      coverStatus = 'timeout';
    } else if (latestCoverTask?.status === 'success') {
      coverStatus = 'ready';
    }

    const progress = {
      total: characters.length,
      ready: characters.filter((c) => c.status === 'ready').length,
      failed: characters.filter((c) => c.status === 'failed').length,
      timeout: characters.filter((c) => c.status === 'timeout').length,
    };

    return respData({
      status: project.status,
      initStatus: project.initStatus,
      initError: project.initError,
      storyOutline: project.storyOutline,
      coverImageUrl: project.coverImageUrl,
      coverStatus,
      characterProgress: progress,
      characters: characters.map((character) => ({
        id: character.id,
        name: character.name,
        status: character.status,
        imageUrl: character.imageUrl,
      })),
    });
  } catch (error: any) {
    console.log('init status failed:', error);
    return respErr(error.message || 'init status failed');
  }
}
