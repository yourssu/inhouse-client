import type { z } from 'zod';

import { api } from '@/apis/api';

type GeneratedRequestOptions<T> = RequestInit & { schema?: z.ZodType<T> };

// 조회 결과와 본문 없는 등록 응답의 반환형을 구분합니다.
export function generatedRequest<T>(
  url: string,
  options: GeneratedRequestOptions<T> & { schema: z.ZodType<T> },
): Promise<T>;
export function generatedRequest<T>(
  url: string,
  options: GeneratedRequestOptions<T> & { schema?: never },
): Promise<void>;
export async function generatedRequest<T>(
  url: string,
  { schema, ...options }: GeneratedRequestOptions<T>,
): Promise<T | void> {
  const response = api(url, options);
  if (schema) {
    return schema.parse(await response.json<unknown>());
  }
  // 스키마가 없는 등록 성공 응답은 본문을 읽지 않습니다.
  await response;
}
