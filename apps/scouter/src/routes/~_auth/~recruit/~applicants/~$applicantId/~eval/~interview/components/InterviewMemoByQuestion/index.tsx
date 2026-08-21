import { useSuspenseQuery } from '@tanstack/react-query';
import { Divider } from '@yourssu-inhouse/interior';

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
  const { data: rawMemos } = useSuspenseQuery(interviewMemosOption(applicantId));

  const memos = rawMemos.find((group) => group.sectionId === sectionId)?.comments ?? [];
  const sortedMemos = [...memos].sort(compareByCreatedAtAsc);

  return (
    <div className="flex flex-col">
      <Divider />
      <div className="flex flex-col gap-1 p-5">
        <span className="text-18 font-semibold">메모 {sortedMemos.length}개</span>
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
