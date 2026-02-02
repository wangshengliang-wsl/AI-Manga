export interface Storyboard {
  id: string;
  projectId: string;
  userId: string;
  sortOrder: number;
  description: string | null;
  characterIds: string[];
  imageUrl: string | null;
  imagePrompt: string | null;
  imageStatus: string | null;
  imageTaskId: string | null;
  imageError: string | null;
  videoUrl: string | null;
  videoPrompt: string | null;
  videoStatus: string | null;
  videoTaskId: string | null;
  videoError: string | null;
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

export async function getStoryboardList(projectId: string) {
  const url = `/api/storyboard/list?projectId=${encodeURIComponent(projectId)}`;
  return requestJson<Storyboard[]>(url, { method: 'GET' });
}

export async function generateStoryboards(projectId: string, count?: number) {
  return requestJson<Storyboard[]>('/api/storyboard/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, count }),
  });
}

export async function generateStoryboardImage(storyboardId: string) {
  return requestJson<any>('/api/storyboard/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboardId }),
  });
}

export async function generateStoryboardVideo(storyboardId: string) {
  return requestJson<any>('/api/storyboard/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboardId }),
  });
}

export async function updateStoryboard(data: {
  storyboardId: string;
  description?: string;
  characterIds?: string[];
  imagePrompt?: string;
  videoPrompt?: string;
  sortOrder?: number;
}) {
  return requestJson<Storyboard>('/api/storyboard/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteStoryboard(storyboardId: string) {
  return requestJson<void>('/api/storyboard/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboardId }),
  });
}
