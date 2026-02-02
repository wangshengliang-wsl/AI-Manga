export function getStoryOutlinePrompt(
  projectName: string,
  projectDescription?: string
) {
  return `你是一位专业的故事编剧，擅长创作引人入胜的漫画/动画故事。

请根据以下信息，创作一个完整的故事大纲：

项目名称：${projectName}
项目描述：${projectDescription || ''}

要求：
1. 故事大纲应该包含完整的起承转合
2. 必须明确所有出现的角色及其姓名
3. 故事应该有清晰的主题和情感基调
4. 适合改编为漫画/动画分镜
5. 字数控制在 500-1000 字

请直接输出故事大纲，不需要其他格式。`;
}

export function getCharacterExtractionPrompt(
  storyOutline: string,
  styleName: string,
  stylePrompt: string
) {
  return `你是一位专业的角色设计师，擅长从故事中提取角色信息并设计视觉形象。

故事大纲：
${storyOutline}

风格信息：
风格名称：${styleName}
风格描述：${stylePrompt}

请从故事大纲中提取所有角色，并为每个角色生成详细信息。

输出必须是严格 JSON，不要包含任何解释、Markdown 或代码块。

输出格式 (JSON):
{
  "characters": [
    {
      "name": "角色姓名",
      "description": "角色描述（性格、背景、在故事中的作用）",
      "traits": {
        "gender": "性别",
        "age": "年龄描述",
        "appearance": "外貌特征",
        "personality": "性格特点",
        "clothing": "服装描述"
      },
      "imagePrompt": "角色图片生成提示词（英文，包含风格描述）"
    }
  ]
}

角色图片提示词要求：
1. 必须使用英文
2. 必须包含以下风格描述：${stylePrompt}
3. 背景为纯白色 (white background)
4. 单人半身像或全身像
5. 详细描述角色的外貌、服装、表情
6. 不要包含任何场景元素`;
}

export function getStoryboardGenerationPrompt(
  projectName: string,
  storyOutline: string,
  characters: Array<{ id: string; name: string; description?: string }>,
  styleName: string,
  stylePrompt: string,
  count: number
) {
  const characterList = characters
    .map((c) => `- ${c.name} (ID: ${c.id}): ${c.description || ''}`)
    .join('\n');

  return `你是一位专业的分镜师，擅长将故事转化为视觉分镜。

项目信息：
项目名称：${projectName}
故事大纲：${storyOutline}

角色列表：
${characterList}

风格信息：
风格名称：${styleName}
风格描述：${stylePrompt}

请根据故事大纲，创作 ${count} 个连续的分镜。

输出必须是严格 JSON，不要包含任何解释、Markdown 或代码块。

输出格式 (JSON):
{
  "storyboards": [
    {
      "sortOrder": 1,
      "description": "分镜描述（包含：场景描述、角色动作、对话内容、景别说明如特写/中景/远景）",
      "characterIds": ["出现在此分镜中的角色ID数组"],
      "imagePrompt": "分镜图生成提示词（英文，详见下方要求）",
      "videoPrompt": "运镜视频提示词（英文，描述画面如何动起来）"
    }
  ]
}

分镜图提示词 (imagePrompt) 要求：
1. 必须使用英文
2. 必须包含以下风格描述：${stylePrompt}
3. 详细描述场景、角色位置、表情、动作
4. 说明景别（close-up / medium shot / wide shot）
5. 描述光线和氛围

运镜视频提示词 (videoPrompt) 要求：
1. 必须使用英文
2. 描述摄像机运动（pan / tilt / zoom / track）
3. 描述画面中的动态元素（角色动作、环境变化）
4. 时长约 3-5 秒的运动描述
5. 示例：
   - "Camera slowly pans from left to right, following the character walking"
   - "Zoom in on character's face as they express surprise"
   - "Static shot with cherry blossom petals gently falling"

补充要求：
1. characterIds 只能使用上方提供的角色 ID，不允许编造新 ID`;
}

export function getCoverImagePrompt(
  projectName: string,
  styleName: string,
  stylePrompt: string,
  aspectRatio: string
) {
  return `${styleName} style anime cover illustration.
${stylePrompt}
Scene description: A dramatic cover image for "${projectName}" featuring the main characters.
High quality, detailed, professional anime cover art.
Aspect ratio: ${aspectRatio}`;
}

export function getCharacterImagePrompt(
  characterName: string,
  characterTraits: string,
  stylePrompt: string
) {
  return `${stylePrompt}
Character portrait of ${characterName}.
${characterTraits}
White background, clean portrait, no scene elements.
High quality character design, detailed features.
Aspect ratio: 1:1`;
}
