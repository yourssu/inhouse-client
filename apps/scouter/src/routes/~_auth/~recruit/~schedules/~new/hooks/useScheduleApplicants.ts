import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { PartType } from '@/apis/parts/schema';

import { applicantsOption } from '@/apis/applicants/query';
import { partsOption } from '@/apis/parts/query';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';

interface UseScheduleApplicantsReturn {
  allApplicants: ApplicantType[];
  applicants: ApplicantType[];
  parts: PartType[];
  selectedPart: PartType | undefined;
}

/**
 * 일정 생성에 필요한 지원자/파트 데이터를 제공하는 훅입니다.
 * ScheduleCreationView와 SaveScheduleButton에서 공유되어 데이터 중복 페칭을 방지합니다.
 * (React Query의 캐싱으로 실제 네트워크 요청은 중복되지 않지만, 필터링 로직의 중복도 제거됩니다.)
 */
export const useScheduleApplicants = (): UseScheduleApplicantsReturn => {
  const { selectedPartId, selectedSemesterId } = useScheduleCreationContext();

  const { data: parts } = useSuspenseQuery(partsOption());
  const { data: allApplicants } = useSuspenseQuery(
    applicantsOption({
      semesterId: selectedSemesterId ?? undefined,
      state: '심사 진행 중',
    }),
  );

  const selectedPart = parts.find((p) => p.partId === selectedPartId);

  const applicants = useMemo(() => {
    return selectedPart
      ? allApplicants.filter((a) => a.part === selectedPart.partName)
      : allApplicants;
  }, [allApplicants, selectedPart]);

  return { parts, allApplicants, applicants, selectedPart };
};

/**
 * draftSchedules에서 특정 지원자의 일정 존재 여부를 O(1)로 확인할 수 있는
 * Set을 제공하는 훅입니다.
 *
 * 이전: hasSchedule()에서 매 렌더링마다 O(n) 선형 탐색
 * 이후: Set.has()로 O(1) 확인
 */
export const useScheduledApplicantIds = (): Set<number> => {
  const { draftSchedules } = useScheduleCreationContext();

  return useMemo(() => new Set(draftSchedules.map((s) => s.applicantId)), [draftSchedules]);
};
