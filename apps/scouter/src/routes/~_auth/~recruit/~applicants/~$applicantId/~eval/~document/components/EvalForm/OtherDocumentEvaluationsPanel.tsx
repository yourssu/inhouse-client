import * as Collapsible from '@radix-ui/react-collapsible';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { Badge, Divider, Result, useToast } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { useState } from 'react';
import { MdLockOutline, MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';
import { SwitchCase } from 'react-simplikit';

import type {
  ApplicantDocumentOthersEvaluationsType,
  DocumentEvaluatorStatusValue,
} from '@/apis/documents/schema';

import {
  documentEvaluatorStatusesOption,
  getApplicantDocumentsEvaluationsOption,
  getApplicantDocumentsOthersEvaluationsOption,
} from '@/apis/documents/query';
import { DocumentAverageScoreSummary } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm/DocumentAverageScoreSummary';

interface OtherDocumentEvaluationsPanelProps {
  applicantId: number;
  documentAverageScore?: null | number;
}

export const OtherDocumentEvaluationsPanel = ({
  applicantId,
  documentAverageScore,
}: OtherDocumentEvaluationsPanelProps) => {
  const [{ data: myEvaluation }, { data: othersEvaluations }] = useSuspenseQueries({
    queries: [
      getApplicantDocumentsEvaluationsOption(applicantId),
      getApplicantDocumentsOthersEvaluationsOption(applicantId),
    ],
  });

  if (myEvaluation.items.length === 0) {
    return <LockedOtherDocumentEvaluations />;
  }

  return (
    <SubmittedOtherDocumentEvaluations
      applicantId={applicantId}
      documentAverageScore={documentAverageScore}
      othersEvaluations={othersEvaluations}
    />
  );
};

const LockedOtherDocumentEvaluations = () => {
  const toast = useToast();

  const handleClick = () => {
    toast.error('평가 제출 후 다른 평가자의 평가를 확인할 수 있어요.');
  };

  return (
    <div className="flex w-full flex-col gap-5 pt-2">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">다른 평가자 평가</h2>
        <p className="text-neutralMuted text-sm">
          평가를 제출하면 다른 평가자의 평가를 확인할 수 있어요.
        </p>
      </header>

      <button
        className="border-greyOpacity200 hover:bg-greyOpacity50 focus-visible:outline-violet500 rounded-10 flex w-full cursor-pointer items-center justify-between gap-3 border bg-transparent px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        onClick={handleClick}
        type="button"
      >
        <span className="font-semibold">다른 평가자 보기</span>
        <span className="text-neutralMuted flex shrink-0 items-center gap-1 text-sm">
          <MdLockOutline aria-hidden className="size-4" />
          <span>제출 후 공개</span>
        </span>
      </button>
    </div>
  );
};

interface SubmittedOtherDocumentEvaluationsProps {
  applicantId: number;
  documentAverageScore?: null | number;
  othersEvaluations: ApplicantDocumentOthersEvaluationsType;
}

const SubmittedOtherDocumentEvaluations = ({
  applicantId,
  documentAverageScore,
  othersEvaluations,
}: SubmittedOtherDocumentEvaluationsProps) => {
  const { data: statuses } = useSuspenseQueries({
    queries: [documentEvaluatorStatusesOption(applicantId)],
  })[0];

  const submittedCount = statuses.filter(({ status }) => status === 'SUBMITTED').length;
  const unsubmittedEvaluators = statuses.filter(({ status }) => status !== 'SUBMITTED');
  const hasOtherEvaluators = othersEvaluations.length > 0 || unsubmittedEvaluators.length > 0;

  return (
    <div className="flex w-full flex-col gap-5 pt-2">
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">다른 평가자 평가</h2>
        <DocumentAverageScoreSummary
          documentAverageScore={documentAverageScore}
          submittedCount={submittedCount}
        />
      </header>

      {!hasOtherEvaluators ? (
        <Result
          figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
          title="아직 다른 평가자가 없어요"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {othersEvaluations.map(
            ({
              evaluatorId,
              evaluatorName,
              evaluatorNickname,
              totalScore,
              overallComment,
              result,
            }) => (
              <OtherDocumentEvaluationCollapsible
                evaluatorName={evaluatorNickname ?? evaluatorName}
                key={evaluatorId}
                overallComment={overallComment}
                result={result}
                totalScore={totalScore}
              />
            ),
          )}
          {unsubmittedEvaluators.map(({ memberId, name, nickname, status }) => (
            <UnsubmittedDocumentEvaluatorCard
              key={memberId}
              name={nickname ?? name}
              status={status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OtherDocumentEvaluationCollapsible = ({
  evaluatorName,
  overallComment,
  result,
  totalScore,
}: {
  evaluatorName: string;
  overallComment: string;
  result: string;
  totalScore: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      className="border-greyOpacity200 rounded-10 overflow-clip border"
      onOpenChange={setOpen}
      open={open}
    >
      <Collapsible.Trigger
        className="hover:bg-greyOpacity50 focus-visible:outline-violet500 flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        type="button"
      >
        <span className="min-w-0 truncate font-semibold">{evaluatorName}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-sm tabular-nums">{totalScore} / 100</span>
          <SwitchCase
            caseBy={{
              DOCUMENT_PASS: () => (
                <Badge color="green" size="sm">
                  서류 합격
                </Badge>
              ),
              DOCUMENT_FAIL: () => (
                <Badge color="red" size="sm">
                  서류 불합격
                </Badge>
              ),
              PENDING: () => (
                <Badge color="yellow" size="sm">
                  보류
                </Badge>
              ),
            }}
            value={result}
          />
          {open ? (
            <MdOutlineExpandLess aria-hidden className="size-5" />
          ) : (
            <MdOutlineExpandMore aria-hidden className="size-5" />
          )}
        </span>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <Divider />
        <section className="flex flex-col gap-2 px-4 py-4">
          <h3 className="font-semibold">총평</h3>
          <p className="text-neutralMuted text-sm whitespace-pre-wrap">
            {overallComment || '작성된 총평이 없어요.'}
          </p>
        </section>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

interface UnsubmittedDocumentEvaluatorCardProps {
  name: string;
  status: DocumentEvaluatorStatusValue;
}

const UnsubmittedDocumentEvaluatorCard = ({
  name,
  status,
}: UnsubmittedDocumentEvaluatorCardProps) => {
  const statusOption = documentEvaluatorStatusOptions[status];

  return (
    <div className="border-greyOpacity200 rounded-10 flex w-full items-center justify-between gap-3 border px-4 py-3">
      <span className="min-w-0 truncate font-semibold">{name}</span>
      <Badge color={statusOption.color} size="sm">
        {statusOption.label}
      </Badge>
    </div>
  );
};

const documentEvaluatorStatusOptions = {
  NOT_STARTED: { color: 'grey', label: '미작성' },
  IN_PROGRESS: { color: 'grey', label: '작성 중' },
  SUBMITTED: { color: 'violet', label: '제출 완료' },
} satisfies Record<DocumentEvaluatorStatusValue, { color: 'grey' | 'violet'; label: string }>;
