import { envConfigs } from '@/config';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import {
  createGenerationTask,
  findGenerationTaskByTaskId,
} from '@/shared/models/generation_task';
import { findProjectById } from '@/shared/models/project';
import {
  findStoryboardById,
  updateStoryboardById,
} from '@/shared/models/storyboard';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';

function isSupportedImageUrl(url: string) {
  return /\.(png|jpg|jpeg|webp)(\?|#|$)/i.test(url);
}

async function isImageSizeAllowed(url: string) {
  try {
    const resp = await fetch(url, { method: 'HEAD' });
    if (!resp.ok) return true;
    const length = resp.headers.get('content-length');
    if (!length) return true;
    return Number(length) <= 10 * 1024 * 1024;
  } catch {
    return true;
  }
}

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

    if (storyboard.imageStatus !== 'ready' || !storyboard.imageUrl) {
      return respErr('storyboard image not ready');
    }

    if (storyboard.videoTaskId) {
      const task = await findGenerationTaskByTaskId(storyboard.videoTaskId);
      if (task && ['pending', 'processing'].includes(task.status)) {
        return respData(task);
      }
    }

    if (storyboard.videoStatus === 'generating') {
      return respErr('video is generating');
    }

    if (!isSupportedImageUrl(storyboard.imageUrl)) {
      return respErr('imageUrl format not supported');
    }

    if (!storyboard.videoPrompt) {
      return respErr('videoPrompt is required');
    }
    const sizeAllowed = await isImageSizeAllowed(storyboard.imageUrl);
    if (!sizeAllowed) {
      return respErr('imageUrl exceeds 10MB limit');
    }

    const project = await findProjectById(storyboard.projectId);
    if (!project || project.userId !== user.id) {
      return respErr('project not found');
    }

    const aiService = await getAIService();
    const provider = aiService.getProvider('kie');
    if (!provider) {
      return respErr('kie provider not configured');
    }

    const callbackSecret = process.env.KIE_CALLBACK_SECRET;
    const callbackUrl = `${envConfigs.app_url}/api/callback/kie/video${
      callbackSecret ? `?secret=${callbackSecret}` : ''
    }`;

    const aspectRatio =
      project.aspectRatio === '9:16' ? 'portrait' : 'landscape';

    const result = await provider.generate({
      params: {
        mediaType: AIMediaType.VIDEO,
        model: 'sora-2-image-to-video',
        prompt: storyboard.videoPrompt || '',
        options: {
          image_input: [storyboard.imageUrl],
          aspect_ratio: aspectRatio,
          duration: '10',
        },
        callbackUrl,
      },
    });

    const task = await createGenerationTask({
      id: getUuid(),
      userId: user.id,
      projectId: project.id,
      targetType: 'storyboard_video',
      targetId: storyboard.id,
      taskId: result.taskId,
      model: 'sora-2-image-to-video',
      prompt: storyboard.videoPrompt || '',
      options: {
        image_input: [storyboard.imageUrl],
        aspect_ratio: aspectRatio,
        duration: '10',
      },
      status: result.taskStatus,
    });

    await updateStoryboardById(storyboard.id, {
      videoStatus: 'generating',
      videoTaskId: result.taskId,
      videoError: null,
    });

    return respData(task);
  } catch (error: any) {
    console.log('generate storyboard video failed:', error);
    return respErr(error.message || 'generate storyboard video failed');
  }
}
