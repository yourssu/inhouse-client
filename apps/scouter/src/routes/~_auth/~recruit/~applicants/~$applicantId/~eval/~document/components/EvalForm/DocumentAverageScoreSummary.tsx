import clsx from 'clsx';

interface DocumentAverageScoreSummaryProps {
  documentAverageScore?: null | number;
  submittedCount: number;
}

export const DocumentAverageScoreSummary = ({
  documentAverageScore,
  submittedCount,
}: DocumentAverageScoreSummaryProps) => {
  const isAverageScorePending = documentAverageScore == null;

  return (
    <dl className="bg-greyOpacity50 rounded-10 flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-neutralMuted text-sm">서류 평균 점수 (제출자 {submittedCount}명 기준)</dt>
      <dd
        className={clsx('shrink-0 tabular-nums', {
          'text-neutralMuted text-sm font-medium': isAverageScorePending,
          'text-violet500 text-base font-semibold': !isAverageScorePending,
        })}
      >
        {isAverageScorePending ? '집계 전' : `${documentAverageScore} / 100`}
      </dd>
    </dl>
  );
};
