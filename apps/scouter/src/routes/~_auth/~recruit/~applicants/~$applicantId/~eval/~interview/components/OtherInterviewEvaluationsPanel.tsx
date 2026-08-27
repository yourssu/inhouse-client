import * as Collapsible from '@radix-ui/react-collapsible';
import {
  QueryErrorResetBoundary,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Badge, Button, Divider, Result, useToast } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdLockOutline, MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';

import type { ApplicantStateType } from '@/apis/applicants/schema';
import type {
  InterviewEvaluationResult,
  InterviewEvaluatorStatus,
  InterviewEvaluatorStatusValue,
  OtherInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';

import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
  otherInterviewEvaluationsOption,
} from '@/apis/interviews/evaluations/query';
import {
  InterviewAnalyticsContext,
  useInterviewAnalytics,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/analytics';
import { FinalInterviewEvaluationDialog } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/FinalInterviewEvaluationDialog';
import { InterviewAverageScoreSummary } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewAverageScoreSummary';
import { interviewEvaluatorStatusOptions, interviewResultKo } from '@/types/interviews';

interface OtherInterviewEvaluationsPanelProps {
  applicantId: number;
  applicantName: string;
  applicantState: ApplicantStateType;
  interviewAverageScore?: null | number;
}

export const OtherInterviewEvaluationsPanel = ({
  applicantId,
  applicantName,
  applicantState,
  interviewAverageScore,
}: OtherInterviewEvaluationsPanelProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <OtherInterviewEvaluationsError onRetry={resetErrorBoundary} />
          )}
          onReset={reset}
          resetKeys={[applicantId]}
        >
          <Suspense fallback={<OtherInterviewEvaluationsSkeleton />}>
            <OtherInterviewEvaluationsGate
              applicantId={applicantId}
              applicantName={applicantName}
              applicantState={applicantState}
              interviewAverageScore={interviewAverageScore}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

const OtherInterviewEvaluationsGate = ({
  applicantId,
  applicantName,
  applicantState,
  interviewAverageScore,
}: OtherInterviewEvaluationsPanelProps) => {
  const { data: myEvaluation } = useSuspenseQuery(myInterviewEvaluationOption(applicantId));

  if (myEvaluation.submittedAt == null) {
    return (
      <LockedOtherInterviewEvaluations
        applicantId={applicantId}
        applicantName={applicantName}
        applicantState={applicantState}
        interviewAverageScore={interviewAverageScore}
      />
    );
  }

  return (
    <SubmittedOtherInterviewEvaluations
      applicantId={applicantId}
      applicantName={applicantName}
      applicantState={applicantState}
      interviewAverageScore={interviewAverageScore}
    />
  );
};

const LockedOtherInterviewEvaluations = ({
  applicantId,
  applicantName,
}: OtherInterviewEvaluationsPanelProps) => {
  const toast = useToast();

  const handleClick = () => {
    toast.error('평가 제출 후 다른 평가자의 평가를 확인할 수 있어요.');
  };

  return (
    <div className="flex w-full flex-col gap-5">
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
      <Divider />
      <FinalInterviewEvaluationButton
        applicantId={applicantId}
        applicantName={applicantName}
        disabled
        submittedEvaluatorCount={0}
        unsubmittedEvaluators={[]}
      />
    </div>
  );
};

interface SubmittedOtherInterviewEvaluationsProps {
  applicantId: number;
  applicantName: string;
  applicantState: ApplicantStateType;
  interviewAverageScore?: null | number;
}

const SubmittedOtherInterviewEvaluations = ({
  applicantId,
  applicantName,
  applicantState,
  interviewAverageScore,
}: SubmittedOtherInterviewEvaluationsProps) => {
  const [{ data: statuses }, { data: otherEvaluations }] = useSuspenseQueries({
    queries: [
      interviewEvaluatorStatusesOption(applicantId),
      otherInterviewEvaluationsOption(applicantId),
    ],
  });

  const submittedCount = statuses.filter(({ status }) => status === 'SUBMITTED').length;
  const unsubmittedEvaluators = statuses.filter(({ status }) => status !== 'SUBMITTED');
  const hasOtherEvaluators = otherEvaluations.length > 0 || unsubmittedEvaluators.length > 0;

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">다른 평가자 평가</h2>
        <InterviewAverageScoreSummary
          interviewAverageScore={interviewAverageScore}
          submittedCount={submittedCount}
        />
      </header>

      {!hasOtherEvaluators ? (
        <Result title="다른 평가자가 없어요" />
      ) : (
        <div className="flex flex-col gap-3">
          {otherEvaluations.map((evaluation) => (
            <OtherInterviewEvaluationCollapsible
              evaluation={evaluation}
              key={evaluation.evaluatorId}
            />
          ))}
          {unsubmittedEvaluators.map(({ memberId, nickname, status }) => (
            <UnsubmittedInterviewEvaluatorCard key={memberId} name={nickname} status={status} />
          ))}
        </div>
      )}
      <Divider />
      <FinalInterviewEvaluationButton
        applicantId={applicantId}
        applicantName={applicantName}
        disabled={!finalInterviewEvaluationAllowedStates.includes(applicantState)}
        submittedEvaluatorCount={submittedCount}
        unsubmittedEvaluators={unsubmittedEvaluators}
      />
    </div>
  );
};

interface FinalInterviewEvaluationButtonProps {
  applicantId: number;
  applicantName: string;
  disabled: boolean;
  submittedEvaluatorCount: number;
  unsubmittedEvaluators: InterviewEvaluatorStatus[];
}

const FinalInterviewEvaluationButton = ({
  applicantId,
  applicantName,
  disabled,
  submittedEvaluatorCount,
  unsubmittedEvaluators,
}: FinalInterviewEvaluationButtonProps) => {
  const trackInterviewEvent = useInterviewAnalytics();

  const handleClick = () => {
    trackInterviewEvent('interview_final_decision_click', {});
    void overlay.openAsync<boolean>(({ close, isOpen }) => (
      <InterviewAnalyticsContext.Provider value={trackInterviewEvent}>
        <FinalInterviewEvaluationDialog
          applicantId={applicantId}
          applicantName={applicantName}
          close={close}
          isOpen={isOpen}
          submittedEvaluatorCount={submittedEvaluatorCount}
          unsubmittedEvaluators={unsubmittedEvaluators}
        />
      </InterviewAnalyticsContext.Provider>
    ));
  };

  return (
    <Button disabled={disabled} onClick={handleClick} size="lg">
      최종 면접 결과 결정
    </Button>
  );
};

interface OtherInterviewEvaluationCollapsibleProps {
  evaluation: OtherInterviewEvaluation;
}

const OtherInterviewEvaluationCollapsible = ({
  evaluation,
}: OtherInterviewEvaluationCollapsibleProps) => {
  const [open, setOpen] = useState(false);
  const trackInterviewEvent = useInterviewAnalytics();
  const resultOption = interviewEvaluationResultOptions[evaluation.result];

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      trackInterviewEvent('interview_peer_evaluator_view', {
        peer_evaluator_id: evaluation.evaluatorId,
      });
    }
  };

  return (
    <Collapsible.Root
      className="border-greyOpacity200 rounded-10 overflow-clip border"
      onOpenChange={handleOpenChange}
      open={open}
    >
      <Collapsible.Trigger
        className="hover:bg-greyOpacity50 focus-visible:outline-violet500 flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        type="button"
      >
        <span className="min-w-0 truncate font-semibold">{evaluation.evaluatorNickname}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-sm tabular-nums">{evaluation.totalScore} / 100</span>
          <Badge color={resultOption.color} size="sm">
            {resultOption.label}
          </Badge>
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
            {evaluation.overallComment || '작성된 총평이 없어요.'}
          </p>
        </section>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

interface UnsubmittedInterviewEvaluatorCardProps {
  name: string;
  status: InterviewEvaluatorStatusValue;
}

const UnsubmittedInterviewEvaluatorCard = ({
  name,
  status,
}: UnsubmittedInterviewEvaluatorCardProps) => {
  const statusOption = interviewEvaluatorStatusOptions[status];

  return (
    <div className="border-greyOpacity200 rounded-10 flex w-full items-center justify-between gap-3 border px-4 py-3">
      <span className="min-w-0 truncate font-semibold">{name}</span>
      <Badge color={statusOption.color} size="sm">
        {statusOption.label}
      </Badge>
    </div>
  );
};

const OtherInterviewEvaluationsSkeleton = () => {
  return (
    <div
      aria-busy="true"
      aria-label="다른 평가자 평가 불러오는 중"
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-3">
        <div
          aria-hidden
          className="bg-greyOpacity100 h-7 w-36 animate-pulse rounded-lg motion-reduce:animate-none"
        />
        <div className="bg-greyOpacity50 rounded-10 flex items-center justify-between gap-3 px-4 py-3">
          <div
            aria-hidden
            className="bg-greyOpacity100 h-4 w-48 animate-pulse rounded-lg motion-reduce:animate-none"
          />
          <div
            aria-hidden
            className="bg-greyOpacity100 h-5 w-12 animate-pulse rounded-lg motion-reduce:animate-none"
          />
        </div>
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          aria-hidden
          className="bg-greyOpacity100 h-12 w-full animate-pulse rounded-lg motion-reduce:animate-none"
          key={index}
        />
      ))}
    </div>
  );
};

const OtherInterviewEvaluationsError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
      <Result description="잠시 후 다시 시도해 주세요." title="다른 평가를 불러오지 못했어요" />
      <Button onClick={onRetry} size="sm" variant="secondary">
        다시 시도
      </Button>
    </div>
  );
};

const interviewEvaluationResultOptions = {
  PENDING: { color: 'yellow', label: interviewResultKo.PENDING },
  FINAL_PASS: { color: 'green', label: interviewResultKo.FINAL_PASS },
  INTERVIEW_FAIL: { color: 'red', label: interviewResultKo.INTERVIEW_FAIL },
} satisfies Record<InterviewEvaluationResult, { color: 'green' | 'red' | 'yellow'; label: string }>;

const finalInterviewEvaluationAllowedStates: readonly ApplicantStateType[] = [
  'DOCUMENT_ACCEPTED',
  'ASSIGNMENT_ACCEPTED',
  'FINAL_ACCEPTED',
  'INTERVIEW_REJECTED',
];
