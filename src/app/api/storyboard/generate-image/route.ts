import { envConfigs } from '@/config';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { findCharactersByIds } from '@/shared/models/character';
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

    if (storyboard.imageTaskId) {
      const task = await findGenerationTaskByTaskId(storyboard.imageTaskId);
      if (task && ['pending', 'processing'].includes(task.status)) {
        return respData(task);
      }
    }

    if (storyboard.imageStatus === 'generating') {
      return respErr('image is generating');
    }

    if (!storyboard.imagePrompt) {
      return respErr('imagePrompt is required');
    }

    const project = await findProjectById(storyboard.projectId);
    if (!project || project.userId !== user.id) {
      return respErr('project not found');
    }

    const characterIds = Array.isArray(storyboard.characterIds)
      ? storyboard.characterIds
      : [];
    const characters = await findCharactersByIds(characterIds);
    const characterImageUrls = characters
      .filter((c) => c.imageUrl)
      .map((c) => c.imageUrl as string);

    if (!characterImageUrls.length) {
      return respErr(
        'character images missing, please generate character images first'
      );
    }

    const aiService = await getAIService();
    const provider = aiService.getProvider('kie');
    if (!provider) {
      return respErr('kie provider not configured');
    }

    const callbackSecret = process.env.KIE_CALLBACK_SECRET;
    const callbackUrl = `${envConfigs.app_url}/api/callback/kie/image${
      callbackSecret ? `?secret=${callbackSecret}` : ''
    }`;

    const result = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: 'nano-banana-pro',
        prompt: storyboard.imagePrompt || '',
        options: {
          image_input: characterImageUrls,
          aspect_ratio: project.aspectRatio,
          resolution: '2K',
          output_format: 'png',
        },
        callbackUrl,
      },
    });

    const task = await createGenerationTask({
      id: getUuid(),
      userId: user.id,
      projectId: project.id,
      targetType: 'storyboard_image',
      targetId: storyboard.id,
      taskId: result.taskId,
      model: 'nano-banana-pro',
      prompt: storyboard.imagePrompt || '',
      options: {
        image_input: characterImageUrls,
        aspect_ratio: project.aspectRatio,
        resolution: '2K',
        output_format: 'png',
      },
      status: result.taskStatus,
    });

    await updateStoryboardById(storyboard.id, {
      imageStatus: 'generating',
      imageTaskId: result.taskId,
      imageError: null,
    });

    return respData(task);
  } catch (error: any) {
    console.log('generate storyboard image failed:', error);
    return respErr(error.message || 'generate storyboard image failed');
  }
}
