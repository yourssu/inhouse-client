import { Fieldset } from '@yourssu-inhouse/interior';
import { Select } from '@yourssu-inhouse/interior';
import { TabButton } from '@yourssu-inhouse/interior';
import { useMemo } from 'react';
import { MdCheck } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { PartType } from '@/apis/parts/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduledApplicantIds } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import { useSelectPart } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useSelectPart';
import { useScheduleAnalytics } from '@/routes/~_auth/~recruit/~schedules/analytics';
import { partNameKo } from '@/types/parts';

interface ApplicantSelectionPanelProps {
  allApplicants: ApplicantType[];
  applicants: ApplicantType[];
  existingSchedules: InterviewScheduleType[];
  /** 지정되면 파트 선택 대신 이 파트를 일반 텍스트로 보여줘요. 본인 파트로 고정된 사용자예요. */
  fixedPart?: PartType;
  onApplicantSelect?: (applicant: ApplicantType) => void;
  parts: PartType[];
}

export const ApplicantSelectionPanel = ({
  allApplicants,
  applicants,
  existingSchedules,
  fixedPart,
  onApplicantSelect,
  parts,
}: ApplicantSelectionPanelProps) => {
  const { semester, selectedPartId, activeApplicantId, setActiveApplicant } =
    useScheduleCreationContext();
  const trackScheduleEvent = useScheduleAnalytics();

  // O(1) 일정 존재 확인을 위한 Set
  const scheduledIds = useScheduledApplicantIds();

  // 지원자가 있는 파트만 필터링
  const partsWithApplicants = useMemo(() => {
    const partNamesWithApplicants = new Set(allApplicants.map((a) => a.part));
    return parts.filter((p) => partNamesWithApplicants.has(p.partName));
  }, [allApplicants, parts]);

  const selectedPart = parts.find((p) => p.partId === selectedPartId);

  const selectPartWith = useSelectPart({ allApplicants, existingSchedules });

  const handlePartChange = (partNameKoValue: string) => {
    const part = parts.find((p) => partNameKo[p.partName] === partNameKoValue);
    if (part && part.partId !== selectedPartId) {
      const { initialDrafts, partApplicants } = selectPartWith(part, {
        onFirstApplicantSelected: (applicant) => onApplicantSelect?.(applicant),
      });

      trackScheduleEvent('schedule_target_filter_changed', {
        already_scheduled_count: initialDrafts.length,
        filter_type: 'part',
        part: part.partName,
        part_id: part.partId,
        selected_semester: semester,
        target_applicant_count: partApplicants.length,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Fieldset label="현재 학기">
        <p className="text-neutralMuted text-17 font-semibold">{semester}</p>
      </Fieldset>
      {fixedPart ? (
        <Fieldset label="파트">
          <p className="text-neutralMuted text-17 font-semibold">
            {partNameKo[fixedPart.partName]}
          </p>
        </Fieldset>
      ) : (
        <Select
          className="w-full"
          description="지원자가 없는 파트는 표시되지 않아요."
          items={partsWithApplicants.map((p) => partNameKo[p.partName])}
          label="파트 선택"
          onValueChange={handlePartChange}
          placeholder="파트"
          size="lg"
          value={selectedPart ? partNameKo[selectedPart.partName] : undefined}
          variant="dimmed"
        />
      )}

      {selectedPartId && (
        <Fieldset label="지원자 선택">
          <div className="flex flex-col gap-1.5">
            {applicants.map((applicant) => {
              const isActive = activeApplicantId === applicant.applicantId;
              const scheduled = scheduledIds.has(applicant.applicantId);
              return (
                <TabButton
                  active={isActive}
                  key={applicant.applicantId}
                  onClick={() => {
                    setActiveApplicant(applicant.applicantId);
                    onApplicantSelect?.(applicant);
                  }}
                  right={scheduled && <MdCheck className="text-violet600" />}
                  size="lg"
                >
                  {applicant.name}
                </TabButton>
              );
            })}
          </div>
        </Fieldset>
      )}
    </div>
  );
};
