import type { KyInstance } from 'ky';

import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod/v4';

// /me 응답 중 사이드바 프로필 버튼에 필요한 최소 필드만 정의한다.
export const MeSchema = z.object({
  memberId: z.number(),
  nickname: z.string(),
  email: z.string(),
  profileImageUrl: z.string(),
});

export type Me = z.infer<typeof MeSchema>;

// shell 은 remote 가 아닌 host 이므로 plugin namespace 대신 'shell' prefix 로 캐시 충돌을 막는다.
export const meQueryKey = ['shell', 'me'] as const;

export const meOption = (api: KyInstance) =>
  queryOptions({
    queryKey: meQueryKey,
    queryFn: async () => MeSchema.parse(await api.get('members/me').json()),
  });
