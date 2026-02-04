import { getStoryboardGenerationPrompt } from '@/shared/lib/ai-prompts';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { findCharactersByProjectId } from '@/shared/models/character';
import { findProjectById } from '@/shared/models/project';
import { createStoryboards } from '@/shared/models/storyboard';
import { getUserInfo } from '@/shared/models/user';
import { callOpenRouter } from '@/shared/services/openrouter';
import styles from '@/shared/styles/index.json';

interface StyleItem {
  id: number;
  name: string;
  prompt: string;
}

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { projectId, count } = await request.json();
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

    if (project.status !== 'ready') {
      return respErr('project not initialized');
    }

    const characters = await findCharactersByProjectId(projectId);
    const style = (styles as StyleItem[]).find(
      (item) => item.id === project.styleId
    );
    if (!style) {
      return respErr('invalid styleId');
    }

    const storyboardPrompt = getStoryboardGenerationPrompt(
      project.name,
      project.storyOutline || '',
      characters,
      style.name,
      style.prompt,
      count || 5
    );

    const result = await callOpenRouter('', storyboardPrompt, {
      model: 'google/gemini-3-flash-preview',
      responseFormat: 'json_object',
      parseJson: true,
    });

    const data = result.parsedJson || {};
    const storyboards = Array.isArray(data.storyboards) ? data.storyboards : [];
    if (!storyboards.length) {
      return respErr('no storyboards generated');
    }

    const validCharacterIds = new Set(characters.map((c) => c.id));

    const cleaned = storyboards.map((item: any, index: number) => {
      const characterIds = Array.isArray(item.characterIds)
        ? item.characterIds.filter((id: string) => validCharacterIds.has(id))
        : [];
      const uniqueCharacterIds = Array.from(new Set(characterIds));

      const imagePrompt = item.imagePrompt
        ? String(item.imagePrompt).trim()
        : '';
      const videoPrompt = item.videoPrompt
        ? String(item.videoPrompt).trim()
        : '';
      if (!imagePrompt || !videoPrompt) {
        throw new Error('imagePrompt or videoPrompt is missing');
      }

      return {
        id: getUuid(),
        projectId,
        userId: user.id,
        sortOrder: index + 1,
        description: item.description ? String(item.description).trim() : null,
        characterIds: uniqueCharacterIds,
        imagePrompt,
        videoPrompt,
        imageStatus: 'pending',
        videoStatus: 'pending',
      };
    });

    const created = await createStoryboards(cleaned);

    return respData(created);
  } catch (error: any) {
    console.log('generate storyboards failed:', error);
    return respErr(error.message || 'generate storyboards failed');
  }
}
