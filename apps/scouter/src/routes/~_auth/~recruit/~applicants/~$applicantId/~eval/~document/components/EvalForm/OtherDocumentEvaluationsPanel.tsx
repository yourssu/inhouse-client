import * as Collapsible from '@radix-ui/react-collapsible';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { Badge, Divider, Result, useToast } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { useState } from 'react';
import { MdLockOutline, MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';
import { SwitchCase } from 'react-simplikit';

import type { ApplicantDocumentOthersEvaluationsType } from '@/apis/documents/schema';

import {
  getApplicantDocumentsEvaluationsOption,
  getApplicantDocumentsOthersEvaluationsOption,
} from '@/apis/documents/query';

interface OtherDocumentEvaluationsPanelProps {
  applicantId: number;
}

export const OtherDocumentEvaluationsPanel = ({
  applicantId,
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

  return <SubmittedOtherDocumentEvaluations othersEvaluations={othersEvaluations} />;
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

const SubmittedOtherDocumentEvaluations = ({
  othersEvaluations,
}: {
  othersEvaluations: ApplicantDocumentOthersEvaluationsType;
}) => {
  return (
    <div className="flex w-full flex-col gap-5 pt-2">
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">다른 평가자 평가</h2>
      </header>

      {othersEvaluations.length === 0 ? (
        <Result
          figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
          title="아직 다른 평가자가 없어요"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {othersEvaluations.map(
            ({ evaluatorId, evaluatorName, totalScore, overallComment, result }) => (
              <OtherDocumentEvaluationCollapsible
                evaluatorName={evaluatorName}
                key={evaluatorId}
                overallComment={overallComment}
                result={result}
                totalScore={totalScore}
              />
            ),
          )}
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
