import type { z } from 'zod/v4';

import { api } from '@/apis/api';

type OrvalResponse<T> = {
  data: T;
  headers: Headers;
  status: number;
};

type OrvalRequestOptions = RequestInit & {
  schema?: z.ZodType;
};

const getResponseData = async (response: Response) => {
  if (!response.body || [204, 205, 304].includes(response.status)) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('json') ? response.json() : response.text();
};

export const orvalApi = async <T>(
  url: string,
  { schema, ...options }: OrvalRequestOptions,
): Promise<T> => {
  const response = await api(url.replace(/^\//, ''), {
    body: options.body,
    headers: options.headers,
    method: options.method,
    signal: options.signal,
  });
  const data = await getResponseData(response);
  const parsedData = schema?.parse(data) ?? data;
  const result: OrvalResponse<unknown> = {
    data: parsedData,
    headers: response.headers,
    status: response.status,
  };

  // Orval's generated return types model endpoint-specific status codes.
  return result as T;
};
