import { Fieldset } from '@yourssu-inhouse/interior';
import { Select } from '@yourssu-inhouse/interior';
import { TabButton } from '@yourssu-inhouse/interior';
import { useMemo } from 'react';
import { MdCheck } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { PartType } from '@/apis/parts/schema';
import type { SemesterType } from '@/apis/semesters/schema';

import { SemesterSelect } from '@/components/SemesterSelect';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduledApplicantIds } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import { partNameKo } from '@/types/parts';

interface ApplicantSelectionPanelProps {
  allApplicants: ApplicantType[];
  applicants: ApplicantType[];
  onApplicantSelect?: (applicant: ApplicantType) => void;
  parts: PartType[];
}

export const ApplicantSelectionPanel = ({
  allApplicants,
  applicants,
  onApplicantSelect,
  parts,
}: ApplicantSelectionPanelProps) => {
  const {
    selectedPartId,
    selectedSemester,
    activeApplicantId,
    selectPart,
    selectSemester,
    setActiveApplicant,
  } = useScheduleCreationContext();

  // O(1) 일정 존재 확인을 위한 Set
  const scheduledIds = useScheduledApplicantIds();

  // 지원자가 있는 파트만 필터링
  const partsWithApplicants = useMemo(() => {
    const partNamesWithApplicants = new Set(allApplicants.map((a) => a.part));
    return parts.filter((p) => partNamesWithApplicants.has(p.partName));
  }, [allApplicants, parts]);

  const selectedPart = parts.find((p) => p.partId === selectedPartId);

  const handlePartChange = (partNameKoValue: string) => {
    const partName = Object.entries(partNameKo).find(([, ko]) => ko === partNameKoValue)?.[0];
    const part = parts.find((p) => p.partName === partName);
    if (part) {
      selectPart(part.partId);

      // 해당 파트의 첫 번째 지원자를 자동 선택
      const partApplicants = allApplicants.filter((a) => a.part === part.partName);
      if (partApplicants.length > 0) {
        setActiveApplicant(partApplicants[0].applicantId);
        onApplicantSelect?.(partApplicants[0]);
      }
    }
  };

  const handleSemesterChange = (semester: SemesterType) => {
    selectSemester(semester.semesterId, semester.semester);
  };

  return (
    <div className="flex flex-col gap-4">
      <SemesterSelect
        className="w-full"
        label="학기 선택"
        onValueChange={handleSemesterChange}
        size="lg"
        value={selectedSemester ?? undefined}
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
