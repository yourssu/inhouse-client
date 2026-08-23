import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Combobox } from '@yourssu-inhouse/interior';
import { useMemo, useState } from 'react';

import { applicantsOption, applicantsQueryKeys } from '@/apis/applicants/query';
import {
  deleteApplicantDocumentEvaluations,
  deleteApplicantEvaluations,
  deleteApplicantInterviewEvaluations,
} from '@/apis/devTools';
import { interviewEvaluationsQueryKeys } from '@/apis/interviews/evaluations/query';
import { partNameKo } from '@/types/parts';

import { DevToolActionCard } from './DevToolActionCard';
import { openDevToolConfirmation } from './openDevToolConfirmation';

export const EvaluationDevTools = () => {
  const queryClient = useQueryClient();
  const [selectedApplicantId, setSelectedApplicantId] = useState<number>();
  const { data: applicants = [], isError, isPending, refetch } = useQuery(applicantsOption());

  const applicantEntries = useMemo(
    () =>
      applicants
        .toSorted((a, b) => b.applicantId - a.applicantId)
        .map((applicant) => ({
          applicant,
          label: `${applicant.name} · ${partNameKo[applicant.part]} · ${applicant.applicationSemester} · #${applicant.applicantId}`,
        })),
    [applicants],
  );
  const applicantByLabel = useMemo(
    () => new Map(applicantEntries.map((entry) => [entry.label, entry.applicant])),
    [applicantEntries],
  );
  const selectedEntry = applicantEntries.find(
    ({ applicant }) => applicant.applicantId === selectedApplicantId,
  );
  const selectedApplicant = selectedEntry?.applicant;

  const handleApplicantChange = (labels: string[]) => {
    const selectedLabel = labels.at(-1);
    setSelectedApplicantId(
      selectedLabel ? applicantByLabel.get(selectedLabel)?.applicantId : undefined,
    );
  };

  const invalidateApplicantEvaluations = (includeInterview: boolean) => {
    void queryClient.invalidateQueries({ queryKey: applicantsQueryKeys.all() });

    if (includeInterview && selectedApplicant) {
      void queryClient.invalidateQueries({
        queryKey: interviewEvaluationsQueryKeys.applicant(selectedApplicant.applicantId),
      });
    }
  };

  const openDeleteConfirmation = ({
    confirmText,
    description,
    includeInterview,
    mutationFn,
    successText,
    title,
  }: {
    confirmText: string;
    description: string;
    includeInterview: boolean;
    mutationFn: (applicantId: number) => Promise<void>;
    successText: string;
    title: string;
  }) => {
    if (!selectedApplicant) {
      return;
    }

    void openDevToolConfirmation({
      confirmText,
      description,
      mutationFn: () => mutationFn(selectedApplicant.applicantId),
      onSuccess: () => invalidateApplicantEvaluations(includeInterview),
      successText,
      targetDetails: [
        { label: '지원자', value: selectedApplicant.name },
        { label: '파트', value: partNameKo[selectedApplicant.part] },
        { label: '지원 학기', value: selectedApplicant.applicationSemester },
        { label: '지원자 ID', value: String(selectedApplicant.applicantId) },
      ],
      title,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-neutral font-medium">지원자 평가 데이터 관리</p>

      {isError ? (
        <div className="border-greyOpacity200 rounded-10 flex items-center justify-between gap-4 border p-4">
          <p className="text-neutralSubtle text-sm">지원자 목록을 불러오지 못했어요.</p>
          <Button onClick={() => void refetch()} size="sm" type="button" variant="secondary">
            다시 시도
          </Button>
        </div>
      ) : (
        <Combobox
          description={
            isPending
              ? '지원자 목록을 불러오는 중이에요.'
              : '이름, 파트, 학기, ID로 검색할 수 있어요.'
          }
          disabled={isPending}
          items={applicantEntries.map(({ label }) => label)}
          label="지원자"
          onValueChange={handleApplicantChange}
          placeholder={isPending ? '불러오는 중...' : '지원자를 검색해 주세요'}
          value={selectedEntry ? [selectedEntry.label] : []}
        />
      )}

      <div className="flex flex-col gap-3">
        <DevToolActionCard
          buttonText="삭제"
          description="선택한 지원자의 서류 평가 데이터를 삭제해요."
          disabled={!selectedApplicant}
          disabledReason="지원자를 선택하면 실행할 수 있어요."
          onClick={() =>
            openDeleteConfirmation({
              confirmText: '삭제',
              description: '선택한 지원자의 서류 평가 데이터를 삭제할까요?',
              includeInterview: false,
              mutationFn: deleteApplicantDocumentEvaluations,
              successText: '서류 평가 데이터를 삭제했어요.',
              title: '서류 평가 삭제',
            })
          }
          title="서류 평가 삭제"
        />
        <DevToolActionCard
          buttonText="삭제"
          description="선택한 지원자의 면접 평가와 최종 평가 데이터를 함께 삭제해요."
          disabled={!selectedApplicant}
          disabledReason="지원자를 선택하면 실행할 수 있어요."
          onClick={() =>
            openDeleteConfirmation({
              confirmText: '삭제',
              description: '선택한 지원자의 면접 평가와 최종 평가 데이터를 삭제할까요?',
              includeInterview: true,
              mutationFn: deleteApplicantInterviewEvaluations,
              successText: '면접·최종 평가 데이터를 삭제했어요.',
              title: '면접·최종 평가 삭제',
            })
          }
          title="면접·최종 평가 삭제"
        />
        <DevToolActionCard
          buttonText="전체 삭제"
          description="선택한 지원자의 서류, 면접, 최종 평가 데이터를 모두 삭제해요."
          disabled={!selectedApplicant}
          disabledReason="지원자를 선택하면 실행할 수 있어요."
          onClick={() =>
            openDeleteConfirmation({
              confirmText: '삭제',
              description: '선택한 지원자의 모든 평가 데이터를 삭제할까요?',
              includeInterview: true,
              mutationFn: deleteApplicantEvaluations,
              successText: '모든 평가 데이터를 삭제했어요.',
              title: '전체 평가 삭제',
            })
          }
          title="전체 평가 삭제"
        />
      </div>
    </div>
  );
};
