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

export const useScheduledApplicantIds = (): Set<number> => {
  const { draftSchedules } = useScheduleCreationContext();

  return useMemo(() => new Set(draftSchedules.map((s) => s.applicantId)), [draftSchedules]);
};
