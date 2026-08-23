import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Select } from '@yourssu-inhouse/interior';
import { useState } from 'react';

import type { PartType } from '@/apis/parts/schema';
import type { SemesterType } from '@/apis/semesters/schema';

import { deletePartInterviewRubric, resetPartDocumentRubricMaxScores } from '@/apis/devTools';
import { getPartDocumentsRubricsOption } from '@/apis/documents/query';
import { interviewRubricQueryKeys } from '@/apis/interviews/rubrics/query';
import { semestersOption } from '@/apis/semesters/query';
import { PartSelect } from '@/components/PartSelect';
import { partNameKo } from '@/types/parts';
import { formatRecruitingSemester } from '@/utils/semester';

import { DevToolActionCard } from './DevToolActionCard';
import { openDevToolConfirmation } from './openDevToolConfirmation';

export const RubricDevTools = () => {
  const queryClient = useQueryClient();
  const [selectedPart, setSelectedPart] = useState<PartType>();
  const [selectedSemester, setSelectedSemester] = useState<SemesterType>();
  const { data: semesters } = useSuspenseQuery(semestersOption());

  const sortedSemesters = semesters.toSorted((a, b) => b.year - a.year || b.term - a.term);
  const semesterItems = sortedSemesters.map(formatRecruitingSemester);
  const selectedSemesterLabel = selectedSemester
    ? formatRecruitingSemester(selectedSemester)
    : undefined;

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(
      sortedSemesters.find((semester) => formatRecruitingSemester(semester) === value),
    );
  };

  const handleResetDocumentMaxScores = () => {
    if (!selectedPart) {
      return;
    }

    void openDevToolConfirmation({
      confirmText: '배점 초기화',
      description:
        '선택한 파트의 서류 평가 항목에 설정된 모든 최대 배점을 0점으로 초기화할까요? 평가 데이터가 남아 있으면 실행되지 않아요.',
      mutationFn: () => resetPartDocumentRubricMaxScores(selectedPart.partId),
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getPartDocumentsRubricsOption(selectedPart.partId).queryKey,
        });
      },
      successText: '서류 평가 배점을 초기화했어요.',
      targetDetails: [
        { label: '파트', value: partNameKo[selectedPart.partName] },
        { label: '파트 ID', value: String(selectedPart.partId) },
      ],
      title: '서류 평가 배점 초기화',
    });
  };

  const handleDeleteInterviewRubric = () => {
    if (!selectedPart || !selectedSemesterLabel) {
      return;
    }

    const params = {
      partId: selectedPart.partId,
      semester: selectedSemesterLabel,
    };

    void openDevToolConfirmation({
      confirmText: '배점 초기화',
      description:
        '선택한 파트와 학기의 면접 평가 배점 설정을 초기화할까요? 요구 조건은 유지되고 다음 조회에서는 배점이 설정되지 않은 평가표가 표시돼요. 평가 데이터가 남아 있으면 실행되지 않아요.',
      mutationFn: () => deletePartInterviewRubric(params),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: interviewRubricQueryKeys.part(params) });
      },
      successText: '면접 평가 배점 설정을 초기화했어요.',
      targetDetails: [
        { label: '파트', value: partNameKo[selectedPart.partName] },
        { label: '파트 ID', value: String(selectedPart.partId) },
        { label: '학기', value: selectedSemesterLabel },
      ],
      title: '면접 평가 배점 초기화',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-neutral font-medium">파트 배점 관리</p>

      <div className="grid grid-cols-2 gap-3">
        <PartSelect
          label="파트"
          onValueChange={setSelectedPart}
          size="md"
          value={selectedPart?.partName}
          variant="outline"
        />
        <Select
          items={semesterItems}
          label="학기"
          onValueChange={handleSemesterChange}
          placeholder="학기"
          size="md"
          value={selectedSemesterLabel}
          variant="outline"
        />
      </div>

      <div className="flex flex-col gap-3">
        <DevToolActionCard
          buttonText="초기화"
          description="선택한 파트의 서류 평가 항목별 최대 배점을 모두 0점으로 바꿔요."
          disabled={!selectedPart}
          disabledReason="파트를 선택하면 실행할 수 있어요."
          onClick={handleResetDocumentMaxScores}
          title="서류 평가 배점 초기화"
        />
        <DevToolActionCard
          buttonText="초기화"
          description="요구 조건은 유지하고 선택한 파트와 학기의 면접 평가 배점 설정을 초기화해요."
          disabled={!selectedPart || !selectedSemester}
          disabledReason="파트와 학기를 모두 선택하면 실행할 수 있어요."
          onClick={handleDeleteInterviewRubric}
          title="면접 평가 배점 초기화"
        />
      </div>
    </div>
  );
};
