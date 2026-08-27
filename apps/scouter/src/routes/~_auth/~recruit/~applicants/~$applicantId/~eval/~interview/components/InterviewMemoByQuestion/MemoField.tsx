import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { type KeyboardEvent, useRef, useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import { postApplicantInterviewMemo } from '@/apis/interviews/memos';
import { interviewMemosQueryKey } from '@/apis/interviews/memos/query';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { useInterviewAnalytics } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/analytics';

interface MemoFieldProps {
  applicantId: number;
  sectionId: number;
}

export const MemoField = ({ applicantId, sectionId }: MemoFieldProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';
  const { invalidate: invalidateMemos } = useQueryInvalidation(interviewMemosQueryKey(applicantId));
  const trackInterviewEvent = useInterviewAnalytics();

  const { isPending: isWritePending, mutateWithToast: writeMemoWithToast } = useToastedMutation({
    mutationFn: postApplicantInterviewMemo,
    successText: '메모를 작성했어요.',
    onSuccess: () => {
      trackInterviewEvent('interview_question_memo_saved', { question_id: sectionId });
      invalidateMemos();
      setContent('');
      if (textareaRef.current != null) {
        textareaRef.current.style.height = 'auto';
      }
    },
  });

  const handleAddMemo = () => {
    if (isContentEmpty) {
      return;
    }
    if (isWritePending) {
      return;
    }

    writeMemoWithToast({
      applicantId,
      data: { content: trimmedContent, sectionId },
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }
      if (e.nativeEvent.isComposing) {
        return;
      }
      e.preventDefault();
      if (!isContentEmpty && !isWritePending) {
        handleAddMemo();
      }
    }
  };

  return (
    <div className="flex items-end gap-1">
      <MultilineTextField
        className="min-h-fit overflow-hidden p-1.5"
        disabled={isWritePending}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메모 추가"
        ref={textareaRef}
        rows={1}
        value={content}
        withHeightAutoResize={true}
      />
      <IconButton
        aria-label="메모 등록"
        disabled={isWritePending || isContentEmpty}
        onClick={handleAddMemo}
        size="md"
      >
        <BsArrowUpCircleFill className="size-5" />
      </IconButton>
    </div>
  );
};
