export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  aspectRatio: '16:9' | '9:16' | string;
  styleId: number;
  storyOutline: string | null;
  status: string;
  initStatus: string;
  initError: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface InitStatusResponse {
  status: string;
  initStatus: string;
  initError: string | null;
  storyOutline: string | null;
  coverImageUrl: string | null;
  coverStatus: string;
  characterProgress: {
    total: number;
    ready: number;
    failed: number;
    timeout: number;
  };
  characters: {
    id: string;
    name: string;
    status: string;
    imageUrl: string | null;
  }[];
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

export async function createProject(data: {
  name: string;
  description?: string;
  aspectRatio: '16:9' | '9:16';
  styleId: number;
}) {
  return requestJson<Project>('/api/project/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getProjectList(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.status) query.set('status', params.status);
  const url = `/api/project/list?${query.toString()}`;
  return requestJson<{ list: Project[]; total: number; page: number; pageSize: number }>(url, {
    method: 'GET',
  });
}

export async function getProjectInfo(projectId: string) {
  const url = `/api/project/info?projectId=${encodeURIComponent(projectId)}`;
  return requestJson<Project>(url, { method: 'GET' });
}

export async function updateProject(data: {
  projectId: string;
  name?: string;
  description?: string;
  aspectRatio?: '16:9' | '9:16';
  styleId?: number;
}) {
  return requestJson<Project>('/api/project/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteProject(projectId: string) {
  return requestJson<void>('/api/project/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
}

export async function initStory(projectId: string) {
  return requestJson<{ message: string }>('/api/project/init-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
}

export async function getInitStatus(projectId: string) {
  const url = `/api/project/init-status?projectId=${encodeURIComponent(projectId)}`;
  return requestJson<InitStatusResponse>(url, { method: 'GET' });
}
