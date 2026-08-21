import type { Prettify } from '@yourssu-inhouse/inhouse-utils/type';

import { useSuspenseQueries } from '@tanstack/react-query';
import { Badge, HoverTooltip } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdInfoOutline } from 'react-icons/md';

import type {
  InterviewEvaluatorStatus,
  InterviewEvaluatorStatusValue,
  OtherInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';
import type { MeType } from '@/apis/members/schema';

import {
  interviewEvaluatorStatusesOption,
  otherInterviewEvaluationsOption,
} from '@/apis/interviews/evaluations/query';
import { meOption } from '@/apis/members/query';
import { interviewEvaluatorStatusOptions } from '@/types/interviews';

interface PeerItemScoresTooltipProps {
  applicantId: number;
  isMyEvaluationSubmitted: boolean;
  itemId: number;
  maxScore: number;
  title: string;
}

export const PeerItemScoresTooltip = ({
  applicantId,
  isMyEvaluationSubmitted,
  itemId,
  maxScore,
  title,
}: PeerItemScoresTooltipProps) => (
  <HoverTooltip
    content={
      isMyEvaluationSubmitted ? (
        <ErrorBoundary fallbackRender={() => <PeerItemScoresError />}>
          <Suspense fallback={<PeerItemScoresSkeleton />}>
            <PeerItemScores applicantId={applicantId} itemId={itemId} maxScore={maxScore} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <PeerItemScoresLocked />
      )
    }
    noArrow={true}
  >
    <button
      aria-label={`${title} 다른 평가자 점수 보기`}
      className="text-neutralMuted hover:text-neutral cursor-help"
      type="button"
    >
      <MdInfoOutline aria-hidden className="size-3.5" />
    </button>
  </HoverTooltip>
);

interface PeerItemScoresProps {
  applicantId: number;
  itemId: number;
  maxScore: number;
}

const PeerItemScores = ({ applicantId, itemId, maxScore }: PeerItemScoresProps) => {
  const peerScoreRows = useSuspenseQueries({
    queries: [
      { ...interviewEvaluatorStatusesOption(applicantId), staleTime: 1000 * 60 },
      {
        ...otherInterviewEvaluationsOption(applicantId),
        select: (data: OtherInterviewEvaluation[]) =>
          new Map(
            data.map(({ evaluatorId, items }) => [
              evaluatorId,
              items.find((item) => item.itemId === itemId)?.score,
            ]),
          ),
        staleTime: 1000 * 60,
      },
      { ...meOption(), staleTime: Infinity },
    ],
    combine: combinePeerScoreRows,
  });

  if (peerScoreRows.length === 0) {
    return <span className="text-13 whitespace-nowrap">다른 평가자가 없어요.</span>;
  }

  return (
    <div className="flex min-w-36 flex-col gap-2.5">
      <span className="text-neutralSubtle text-xs font-semibold whitespace-nowrap">
        다른 평가자 점수
      </span>
      <div className="flex flex-col gap-1.5">
        {peerScoreRows.map(({ name, score, status, userId }) => {
          const evaluationStatusOption = interviewEvaluatorStatusOptions[status];
          const badgeLabel =
            status === 'SUBMITTED' ? `${score ?? '-'} / ${maxScore}` : evaluationStatusOption.label;

          return (
            <div className="flex items-center justify-between gap-3" key={userId}>
              <span className="text-13 whitespace-nowrap">{name}</span>
              <Badge color={evaluationStatusOption.color} size="sm">
                {badgeLabel}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PeerItemScoresLocked = () => (
  <span className="text-13 whitespace-nowrap">
    내 평가를 제출하면 다른 평가자의 평가를 볼 수 있어요.
  </span>
);

const PeerItemScoresSkeleton = () => (
  <div aria-busy="true" aria-label="다른 평가자 점수 불러오는 중" className="flex flex-col gap-1.5">
    {Array.from({ length: 2 }, (_, index) => (
      <div
        aria-hidden
        className="bg-greyOpacity100 h-4 w-32 animate-pulse rounded-lg motion-reduce:animate-none"
        key={index}
      />
    ))}
  </div>
);

const PeerItemScoresError = () => (
  <span className="text-13 whitespace-nowrap">다른 평가자 점수를 불러오지 못했어요.</span>
);

interface PeerScoreRow {
  name: string;
  score: number | undefined;
  status: InterviewEvaluatorStatusValue;
  userId: number;
}

const combinePeerScoreRows = ([statusesResult, scoreByEvaluatorIdResult, meResult]: [
  { data: InterviewEvaluatorStatus[] },
  { data: Map<number, number | undefined> },
  { data: MeType },
]): Prettify<PeerScoreRow>[] =>
  statusesResult.data
    .filter(({ userId }) => userId !== meResult.data.userId)
    .map(({ name, status, userId }) => ({
      name,
      // 미제출자의 점수는 마스킹될 수 있어서 제출 완료일 때만 읽어요.
      // 제출 완료여도 statuses와 others가 서로 다른 시점에 갱신되면 잠시 비어 있을 수 있어서
      // score는 optional로 두고, 표시하는 쪽에서 '-'로 떨어뜨려요.
      score: status === 'SUBMITTED' ? scoreByEvaluatorIdResult.data.get(userId) : undefined,
      status,
      userId,
    }));
