import { useSuspenseQuery } from '@tanstack/react-query';
import { Divider, IconButton, useToast } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { MdRefresh } from 'react-icons/md';

import type { InterviewMemoType } from '@/apis/interviews/memos/schema';

import { interviewMemosOption } from '@/apis/interviews/memos/query';

import { MemoField } from './MemoField';
import { MemoItem } from './MemoItem';

interface InterviewMemoByQuestionProps {
  applicantId: number;
  sectionId: number;
}

export const InterviewMemoByQuestion = ({
  applicantId,
  sectionId,
}: InterviewMemoByQuestionProps) => {
  const toast = useToast();
  const {
    data: rawMemos,
    isFetching,
    refetch,
  } = useSuspenseQuery(interviewMemosOption(applicantId));

  const memos = rawMemos.find((group) => group.sectionId === sectionId)?.comments ?? [];
  const sortedMemos = [...memos].sort(compareByCreatedAtAsc);

  const handleRefresh = async () => {
    if (isFetching) {
      return;
    }

    const result = await refetch();
    if (result.isError) {
      toast.error('메모를 새로고침하지 못했어요. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="flex flex-col">
      <Divider />
      <div className="flex items-center justify-between gap-1 p-5">
        <span className="text-18 font-semibold">메모 {sortedMemos.length}개</span>
        <IconButton
          aria-busy={isFetching}
          aria-label="메모 새로고침"
          disabled={isFetching}
          onClick={handleRefresh}
          size="sm"
          tooltipContent="새로고침"
          type="button"
        >
          <MdRefresh
            aria-hidden="true"
            className={clsx('size-5', isFetching && 'motion-safe:animate-spin')}
          />
        </IconButton>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <MemoField applicantId={applicantId} key={sectionId} sectionId={sectionId} />
        {sortedMemos.map((memo) => (
          <MemoItem applicantId={applicantId} key={memo.commentId} memo={memo} />
        ))}
      </div>
    </div>
  );
};

const compareByCreatedAtAsc = (a: InterviewMemoType, b: InterviewMemoType) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
