export interface Project {
  id: string;
  name: string;
  coverUrl: string;
  aspectRatio: '16:9' | '9:16';
  styleId: number;
  description: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Storyboard {
  id: string;
  text: string;
  characterIds: string[];
  imageUrl: string;
  imagePrompt: string;
  videoUrl: string;
  videoPrompt: string;
}

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: '星际漫游记',
    coverUrl: 'https://picsum.photos/seed/proj1/800/450',
    aspectRatio: '16:9',
    styleId: 6,
    description:
      '在遥远的未来，人类已经能够穿越星际。一位年轻的宇航员在一次意外中被传送到了银河系的边缘，他必须找到回家的路。在旅途中，他遇到了各种各样的外星生物，经历了无数冒险，最终发现了宇宙的终极秘密。',
    updatedAt: '2025-01-28T10:30:00Z',
  },
  {
    id: 'proj-002',
    name: '少女侦探日记',
    coverUrl: 'https://picsum.photos/seed/proj2/450/800',
    aspectRatio: '9:16',
    styleId: 1,
    description:
      '高中生小樱拥有超凡的推理能力，她在校园里解决了一个又一个神秘案件。从消失的宝物到神秘的情书，每一个谜题背后都隐藏着意想不到的真相。',
    updatedAt: '2025-01-27T15:45:00Z',
  },
  {
    id: 'proj-003',
    name: '龙族觉醒',
    coverUrl: 'https://picsum.photos/seed/proj3/800/450',
    aspectRatio: '16:9',
    styleId: 3,
    description:
      '在一个被遗忘的古老王国中，最后一条龙与一位流浪剑客结下了不解之缘。他们一起踏上了寻找失落神器的旅程，揭开了尘封千年的秘密。',
    updatedAt: '2025-01-25T09:00:00Z',
  },
  {
    id: 'proj-004',
    name: '都市怪谈',
    coverUrl: 'https://picsum.photos/seed/proj4/450/800',
    aspectRatio: '9:16',
    styleId: 8,
    description:
      '现代都市中流传着各种诡异的传说。一群年轻人为了追寻真相，深入调查这些怪谈背后的故事，却发现真相比传说更加令人毛骨悚然。',
    updatedAt: '2025-01-20T18:20:00Z',
  },
];

export const mockCharacters: Character[] = [
  {
    id: 'char-001',
    name: '林小樱',
    imageUrl: 'https://picsum.photos/seed/char1/400/400',
    description:
      '高中二年级学生，拥有敏锐的观察力和超凡的推理能力。性格开朗活泼，喜欢甜食。',
  },
  {
    id: 'char-002',
    name: '苏云',
    imageUrl: 'https://picsum.photos/seed/char2/400/400',
    description:
      '神秘的转学生，总是独来独往。似乎隐藏着不为人知的秘密，对小樱的调查表现出浓厚的兴趣。',
  },
  {
    id: 'char-003',
    name: '陈老师',
    imageUrl: 'https://picsum.photos/seed/char3/400/400',
    description:
      '班主任老师，表面严肃实则关心学生。年轻时曾是一名刑警，经常为小樱提供线索。',
  },
];

export const mockStoryboards: Storyboard[] = [
  {
    id: 'sb-001',
    text: '清晨的阳光洒进教室，小樱坐在靠窗的位置，看着窗外的樱花树出神。突然，教室门被推开，班主任陈老师走了进来。',
    characterIds: ['char-001', 'char-003'],
    imageUrl: 'https://picsum.photos/seed/sb1/800/450',
    imagePrompt:
      'A classroom scene with morning sunlight, a girl sitting by the window looking at cherry blossoms, anime style',
    videoUrl: '',
    videoPrompt:
      'Camera slowly pans from the window to the classroom door as a teacher enters',
  },
  {
    id: 'sb-002',
    text: '"同学们，今天我们班来了一位新同学。"陈老师的声音打断了小樱的思绪。一个身穿黑色外套的少年走进教室，他的眼神深邃而神秘。',
    characterIds: ['char-001', 'char-002', 'char-003'],
    imageUrl: 'https://picsum.photos/seed/sb2/800/450',
    imagePrompt:
      'A mysterious boy in black jacket standing at the classroom door, anime style, dramatic lighting',
    videoUrl: '',
    videoPrompt:
      'The new student walks slowly into the classroom, all eyes on him',
  },
  {
    id: 'sb-003',
    text: '"我叫苏云，请多指教。"新来的学生简短地自我介绍后，目光却不由自主地看向了小樱的方向。两人的视线在空中交汇。',
    characterIds: ['char-001', 'char-002'],
    imageUrl: 'https://picsum.photos/seed/sb3/800/450',
    imagePrompt:
      'Two students making eye contact across the classroom, intense moment, shoujo manga style',
    videoUrl: '',
    videoPrompt: 'Close-up of both characters eyes meeting, dramatic pause',
  },
  {
    id: 'sb-004',
    text: '放学后，小樱独自走在校园的小路上。她注意到新来的苏云正站在樱花树下，似乎在等着什么人。',
    characterIds: ['char-001', 'char-002'],
    imageUrl: 'https://picsum.photos/seed/sb4/800/450',
    imagePrompt:
      'After school scene, boy standing under cherry blossom tree, soft evening light, anime style',
    videoUrl: '',
    videoPrompt:
      'Sakura petals falling gently, camera focuses on the mysterious student',
  },
  {
    id: 'sb-005',
    text: '"你就是小樱吧？"苏云的声音从身后传来，"我听说过你的故事，那个解决了学校所有悬案的少女侦探。"',
    characterIds: ['char-001', 'char-002'],
    imageUrl: 'https://picsum.photos/seed/sb5/800/450',
    imagePrompt:
      'Two high school students facing each other under cherry blossoms, mysterious atmosphere',
    videoUrl: '',
    videoPrompt:
      'Conversation scene with cherry blossoms in background, slight camera movement',
  },
  {
    id: 'sb-006',
    text: '小樱转过身，直视苏云的眼睛。"你找我有什么事吗？"她的语气中带着警惕，直觉告诉她这个转学生并不简单。',
    characterIds: ['char-001', 'char-002'],
    imageUrl: 'https://picsum.photos/seed/sb6/800/450',
    imagePrompt:
      'Close-up of determined girl facing mysterious boy, tense atmosphere, anime style',
    videoUrl: '',
    videoPrompt: 'Dramatic close-up, wind blowing through their hair',
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getCharactersByIds(ids: string[]): Character[] {
  return mockCharacters.filter((c) => ids.includes(c.id));
}

export function generateProjectId(): string {
  return `proj-${Date.now().toString(36)}`;
}
