import { getAllConfigs } from '@/shared/models/config';

interface CallOpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: 'json_object' | 'text';
  parseJson?: boolean;
  maxRetries?: number;
}

export interface OpenRouterResult {
  content: string;
  raw: any;
  parsedJson?: any;
}

const DEFAULT_MODEL = 'google/gemini-3-flash-preview';

function stripCodeFence(text: string) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  return text.trim();
}

export function parseJsonFromText(text: string) {
  const cleaned = stripCodeFence(text).trim();
  if (!cleaned) return null;
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.search(/[\[{]/);
    const lastBrace = Math.max(
      cleaned.lastIndexOf('}'),
      cleaned.lastIndexOf(']')
    );
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const slice = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(slice);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function readStreamContent(response: Response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.replace(/^data:\s*/, '');
      if (!data || data === '[DONE]') {
        continue;
      }
      try {
        const json = JSON.parse(data);
        const delta =
          json?.choices?.[0]?.delta?.content ??
          json?.choices?.[0]?.message?.content ??
          '';
        if (delta) content += delta;
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return content;
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  options: CallOpenRouterOptions = {}
): Promise<OpenRouterResult> {
  const configs = await getAllConfigs();
  const apiKey = configs.openrouter_api_key;
  if (!apiKey) {
    throw new Error('openrouter_api_key is not set');
  }

  const baseUrl = (
    configs.openrouter_base_url || 'https://openrouter.ai/api/v1'
  ).replace(/\/$/, '');
  const url = `${baseUrl}/chat/completions`;

  const payload: Record<string, any> = {
    model: options.model || DEFAULT_MODEL,
    messages: [
      systemPrompt ? { role: 'system', content: systemPrompt } : null,
      { role: 'user', content: userPrompt },
    ].filter(Boolean),
    temperature: options.temperature ?? 0.7,
    stream: options.stream ?? false,
  };

  if (options.maxTokens) {
    payload.max_tokens = options.maxTokens;
  }

  if (options.responseFormat) {
    payload.response_format = { type: options.responseFormat };
  }

  const maxRetries = options.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`openrouter request failed: ${resp.status} ${text}`);
      }

      if (payload.stream) {
        const content = await readStreamContent(resp);
        const parsedJson = options.parseJson
          ? parseJsonFromText(content)
          : null;
        return { content, raw: null, parsedJson: parsedJson ?? undefined };
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      const parsedJson = options.parseJson ? parseJsonFromText(content) : null;
      return { content, raw: data, parsedJson: parsedJson ?? undefined };
    } catch (error) {
      lastError = error as Error;
      if (attempt >= maxRetries) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }

  throw lastError || new Error('openrouter request failed');
}
