import * as Collapsible from '@radix-ui/react-collapsible';
import {
  QueryErrorResetBoundary,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Badge, Button, Divider, Result, useToast } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdLockOutline, MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';

import type {
  InterviewEvaluationResult,
  InterviewEvaluatorStatusValue,
  OtherInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';

import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
  otherInterviewEvaluationsOption,
} from '@/apis/interviews/evaluations/query';
import { Paper } from '@/components/Paper';

interface OtherInterviewEvaluationsPanelProps {
  applicantId: number;
  interviewAverageScore?: null | number;
}

export const OtherInterviewEvaluationsPanel = ({
  applicantId,
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
  interviewAverageScore,
}: OtherInterviewEvaluationsPanelProps) => {
  const { data: myEvaluation } = useSuspenseQuery(myInterviewEvaluationOption(applicantId));

  if (!myEvaluation.submittedAt) {
    return <LockedOtherInterviewEvaluations />;
  }

  return (
    <SubmittedOtherInterviewEvaluations
      applicantId={applicantId}
      interviewAverageScore={interviewAverageScore}
    />
  );
};

const LockedOtherInterviewEvaluations = () => {
  const toast = useToast();

  const handleClick = () => {
    toast.error('평가 제출 후 다른 평가자의 평가를 확인할 수 있어요.');
  };

  return (
    <Paper className="w-full flex-col gap-5">
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
    </Paper>
  );
};

interface SubmittedOtherInterviewEvaluationsProps {
  applicantId: number;
  interviewAverageScore?: null | number;
}

const SubmittedOtherInterviewEvaluations = ({
  applicantId,
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
  const isAverageScorePending = interviewAverageScore == null;

  return (
    <Paper className="w-full flex-col gap-5">
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">다른 평가자 평가</h2>
        <dl className="bg-greyOpacity50 rounded-10 flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-neutralMuted text-sm">
            면접 평균 점수 (제출자 {submittedCount}명 기준)
          </dt>
          <dd
            className={clsx('shrink-0 tabular-nums', {
              'text-neutralMuted text-sm font-medium': isAverageScorePending,
              'text-violet500 text-base font-semibold': !isAverageScorePending,
            })}
          >
            {isAverageScorePending ? '집계 전' : `${interviewAverageScore} / 100`}
          </dd>
        </dl>
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
          {unsubmittedEvaluators.map(({ name, status, userId }) => (
            <UnsubmittedInterviewEvaluatorCard key={userId} name={name} status={status} />
          ))}
        </div>
      )}
    </Paper>
  );
};

interface OtherInterviewEvaluationCollapsibleProps {
  evaluation: OtherInterviewEvaluation;
}

const OtherInterviewEvaluationCollapsible = ({
  evaluation,
}: OtherInterviewEvaluationCollapsibleProps) => {
  const [open, setOpen] = useState(false);
  const resultOption = interviewEvaluationResultOptions[evaluation.result];

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
        <span className="min-w-0 truncate font-semibold">{evaluation.evaluatorName}</span>
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
    <Paper
      aria-busy="true"
      aria-label="다른 평가자 평가 불러오는 중"
      className="w-full flex-col gap-5"
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
    </Paper>
  );
};

const OtherInterviewEvaluationsError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Paper className="w-full flex-col items-center justify-center gap-4 text-center">
      <Result description="잠시 후 다시 시도해 주세요." title="다른 평가를 불러오지 못했어요" />
      <Button onClick={onRetry} size="sm" variant="secondary">
        다시 시도
      </Button>
    </Paper>
  );
};

const interviewEvaluatorStatusOptions = {
  NOT_STARTED: { color: 'grey', label: '미작성' },
  IN_PROGRESS: { color: 'yellow', label: '미제출' },
  SUBMITTED: { color: 'green', label: '제출 완료' },
} satisfies Record<
  InterviewEvaluatorStatusValue,
  { color: 'green' | 'grey' | 'yellow'; label: string }
>;

const interviewEvaluationResultOptions = {
  PENDING: { color: 'yellow', label: '보류' },
  FINAL_PASS: { color: 'green', label: '면접 합격' },
  INTERVIEW_FAIL: { color: 'red', label: '면접 불합격' },
} satisfies Record<InterviewEvaluationResult, { color: 'green' | 'red' | 'yellow'; label: string }>;
