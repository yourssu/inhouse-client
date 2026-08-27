import { useCallback } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { PartType } from '@/apis/parts/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';
import type { DraftScheduleType } from '@/types/schedule';

import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';

interface SelectPartOptions {
  onFirstApplicantSelected?: (applicant: ApplicantType) => void;
}

interface SelectPartResult {
  /** 선택한 파트의 기존 일정에서 만든 초안 */
  initialDrafts: DraftScheduleType[];
  /** 선택한 파트의 면접 일정 대상 지원자 목록 */
  partApplicants: ApplicantType[];
}

/**
 * 파트를 선택하고, 선택한 파트의 기존 일정을 초안으로 불러오며,
 * 지원자가 있다면 첫 번째 지원자를 활성화한다.
 *
 * 파트 셀렉트 변경(사용자 액션)과 본인 파트 자동 선택(초기 진입)에서 공통으로 사용한다.
 */
export const useSelectPart = ({
  allApplicants,
  existingSchedules,
}: {
  allApplicants: ApplicantType[];
  existingSchedules: InterviewScheduleType[];
}) => {
  const { selectPart, setActiveApplicant } = useScheduleCreationContext();

  return useCallback(
    (part: PartType, { onFirstApplicantSelected }: SelectPartOptions = {}): SelectPartResult => {
      const partApplicants = allApplicants.filter((a) => a.part === part.partName);
      const partApplicantIds = new Set(partApplicants.map((a) => a.applicantId));

      // 선택한 파트의 기존 일정을 초안으로 불러온다.
      // 단, 현재 학기의 면접 일정 대상 상태에 포함되지 않는 지원자의 일정은 제외한다.
      const initialDrafts: DraftScheduleType[] = existingSchedules.flatMap((s) => {
        if (s.part !== part.partName || !partApplicantIds.has(s.applicantId)) {
          return [];
        }
        return [
          {
            applicantId: s.applicantId,
            applicantName: s.name,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
            locationType: s.locationType,
            locationDetail: s.locationDetail ?? null,
            partId: part.partId,
          },
        ];
      });

      selectPart(part.partId, initialDrafts);

      if (partApplicants.length > 0) {
        setActiveApplicant(partApplicants[0].applicantId);
        onFirstApplicantSelected?.(partApplicants[0]);
      }

      return { initialDrafts, partApplicants };
    },
    [allApplicants, existingSchedules, selectPart, setActiveApplicant],
  );
};
