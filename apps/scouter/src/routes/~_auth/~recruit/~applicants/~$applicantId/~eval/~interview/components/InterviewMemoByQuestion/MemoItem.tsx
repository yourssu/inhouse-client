import { useSuspenseQuery } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton } from '@yourssu-inhouse/interior';
import { HiOutlineTrash } from 'react-icons/hi2';

import type { InterviewMemoType } from '@/apis/interviews/memos/schema';

import { deleteApplicantInterviewMemo } from '@/apis/interviews/memos';
import { interviewMemosQueryKey } from '@/apis/interviews/memos/query';
import { meOption } from '@/apis/members/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface MemoItemProps {
  applicantId: number;
  memo: InterviewMemoType;
}

export const MemoItem = ({ applicantId, memo }: MemoItemProps) => {
  const { author, commentId, content, createdAt } = memo;
  const { userId } = author;
  const { data: myData } = useSuspenseQuery(meOption());
  const isMyMemo = userId === myData.userId;

  const openMemoDeletionDialog = useAlertDialog();
  const { invalidate: invalidateMemos } = useQueryInvalidation(interviewMemosQueryKey(applicantId));

  const { isPending: isDeletePending, mutateWithToast: deleteMemoWithToast } = useToastedMutation({
    mutationFn: deleteApplicantInterviewMemo,
    successText: '메모를 삭제했어요.',
    onSuccess: () => {
      invalidateMemos();
    },
  });

  const handleDelete = async () => {
    const isConfirm = await openMemoDeletionDialog({
      title: '메모를 삭제할까요?',
      content: '삭제한 메모는 복구할 수 없어요.',
      closeButton: true,
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm) {
      deleteMemoWithToast({ applicantId, commentId });
    }
  };

  const relativeTime = formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](createdAt);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-13 font-medium">
            {author.nickname} [{author.part}]
          </span>
          <span className="text-neutralSubtle text-xs">{relativeTime}</span>
        </div>
        {isMyMemo && (
          <IconButton
            aria-label="메모 삭제"
            className="rounded-4"
            disabled={isDeletePending}
            onClick={handleDelete}
            size="xxs"
          >
            <HiOutlineTrash className="text-neutral size-4" />
          </IconButton>
        )}
      </div>
      <p className="text-13 min-h-fit whitespace-pre-wrap">{content}</p>
    </div>
  );
};
