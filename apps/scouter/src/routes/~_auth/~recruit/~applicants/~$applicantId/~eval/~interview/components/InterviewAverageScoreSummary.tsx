import clsx from 'clsx';

interface InterviewAverageScoreSummaryProps {
  interviewAverageScore?: null | number;
  submittedCount: number;
}

export const InterviewAverageScoreSummary = ({
  interviewAverageScore,
  submittedCount,
}: InterviewAverageScoreSummaryProps) => {
  const isAverageScorePending = interviewAverageScore == null;

  return (
    <dl className="bg-greyOpacity50 rounded-10 flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-neutralMuted text-sm">면접 평균 점수 (제출자 {submittedCount}명 기준)</dt>
      <dd
        className={clsx('shrink-0 tabular-nums', {
          'text-neutralMuted text-sm font-medium': isAverageScorePending,
          'text-violet500 text-base font-semibold': !isAverageScorePending,
        })}
      >
        {isAverageScorePending ? '집계 전' : `${interviewAverageScore} / 100`}
      </dd>
    </dl>
  );
};
