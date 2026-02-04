export interface Character {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imagePrompt: string | null;
  traits: any;
  status: string;
  taskId: string | null;
  taskError: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const resp = await fetch(input, init);
  if (!resp.ok) {
    throw new Error(`request failed with status: ${resp.status}`);
  }
  const { code, message, data } = await resp.json();
  if (code !== 0) {
    throw new Error(message || 'request failed');
  }
  return data as T;
}

export async function getCharacterList(projectId: string) {
  const url = `/api/character/list?projectId=${encodeURIComponent(projectId)}`;
  return requestJson<Character[]>(url, { method: 'GET' });
}

export async function updateCharacter(data: {
  characterId: string;
  name?: string;
  description?: string;
  traits?: object;
}) {
  return requestJson<Character>('/api/character/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function regenerateCharacterImage(
  characterId: string,
  prompt?: string
) {
  return requestJson<{ taskId: string; status: string }>(
    '/api/character/regenerate-image',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, prompt }),
    }
  );
}
