import { Fieldset } from '@yourssu-inhouse/interior';
import { Select } from '@yourssu-inhouse/interior';
import { TabButton } from '@yourssu-inhouse/interior';
import { useMemo } from 'react';
import { MdCheck } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { PartType } from '@/apis/parts/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';
import type { SemesterType } from '@/apis/semesters/schema';
import type { DraftScheduleType } from '@/types/schedule';

import { SemesterSelect } from '@/components/SemesterSelect';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduledApplicantIds } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import { useScheduleAnalytics } from '@/routes/~_auth/~recruit/~schedules/analytics';
import { partNameKo } from '@/types/parts';
import { formatRecruitingSemester } from '@/utils/semester';

interface ApplicantSelectionPanelProps {
  allApplicants: ApplicantType[];
  applicants: ApplicantType[];
  existingSchedules: InterviewScheduleType[];
  onApplicantSelect?: (applicant: ApplicantType) => void;
  parts: PartType[];
}

export const ApplicantSelectionPanel = ({
  allApplicants,
  applicants,
  existingSchedules,
  onApplicantSelect,
  parts,
}: ApplicantSelectionPanelProps) => {
  const {
    selectedPartId,
    selectedSemester,
    selectedSemesterId,
    activeApplicantId,
    selectPart,
    selectSemester,
    setActiveApplicant,
  } = useScheduleCreationContext();
  const trackScheduleEvent = useScheduleAnalytics();

  // O(1) 일정 존재 확인을 위한 Set
  const scheduledIds = useScheduledApplicantIds();

  // 지원자가 있는 파트만 필터링
  const partsWithApplicants = useMemo(() => {
    const partNamesWithApplicants = new Set(allApplicants.map((a) => a.part));
    return parts.filter((p) => partNamesWithApplicants.has(p.partName));
  }, [allApplicants, parts]);

  const selectedPart = parts.find((p) => p.partId === selectedPartId);

  const handlePartChange = (partNameKoValue: string) => {
    const part = parts.find((p) => partNameKo[p.partName] === partNameKoValue);
    if (part && part.partId !== selectedPartId) {
      // 해당 파트의 첫 번째 지원자를 자동 선택
      const partApplicants = allApplicants.filter((a) => a.part === part.partName);
      const partApplicantIds = new Set(partApplicants.map((a) => a.applicantId));

      // 선택한 파트의 기존 일정을 초안으로 불러온다.
      // 단, 현재 지원자 풀(UNDER_REVIEW)에 없는 지원자의 일정은 제외한다.
      const initialDrafts: DraftScheduleType[] = existingSchedules
        .filter((s) => s.part === part.partName && partApplicantIds.has(s.applicantId))
        .map((s) => ({
          applicantId: s.applicantId,
          applicantName: s.name,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
          locationType: s.locationType,
          locationDetail: s.locationDetail ?? null,
          partId: part.partId,
        }));

      trackScheduleEvent('schedule_target_filter_changed', {
        already_scheduled_count: initialDrafts.length,
        filter_type: 'part',
        part: part.partName,
        part_id: part.partId,
        selected_semester: selectedSemester,
        target_applicant_count: partApplicants.length,
      });

      selectPart(part.partId, initialDrafts);

      if (partApplicants.length > 0) {
        setActiveApplicant(partApplicants[0].applicantId);
        onApplicantSelect?.(partApplicants[0]);
      }
    }
  };

  const handleSemesterChange = (semester: SemesterType) => {
    if (semester.semesterId === selectedSemesterId) {
      return;
    }

    const selectedSemesterLabel = formatRecruitingSemester(semester);
    trackScheduleEvent('schedule_target_filter_changed', {
      filter_type: 'semester',
      selected_semester: selectedSemesterLabel,
    });
    selectSemester(semester.semesterId, selectedSemesterLabel);
  };

  return (
    <div className="flex flex-col gap-4">
      <SemesterSelect
        className="w-full"
        label="학기 선택"
        onValueChange={handleSemesterChange}
        size="lg"
        value={selectedSemester}
        variant="dimmed"
      />
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
