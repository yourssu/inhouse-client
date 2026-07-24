import type { FocusEvent, KeyboardEvent } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import { postApplicantDocumentComment } from '@/apis/eval/comments';
import { commentsQueryKey } from '@/apis/eval/comments/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface AddCommentProps {
  applicantId: number;
  onBlur?: () => void;
  parentCommentId: null | number;
  placeholder: string;
  sectionId: number;
}

export const AddComment = ({
  placeholder,
  applicantId,
  parentCommentId,
  sectionId,
  onBlur,
}: AddCommentProps) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const isNoContent = content === '';

  // 코멘트 작성
  const { isPending: isWritePending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationFn: postApplicantDocumentComment,
    successText: '코멘트를 작성했어요.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
    },
  });

  const handleAddComment = () => {
    writeCommentWithToast({
      applicantId,
      data: { content, sectionId, parentCommentId },
    });

    setContent('');
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!onBlur || !isNoContent) {
      return;
    }
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    onBlur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isNoContent && !isWritePending) {
        handleAddComment();
      }
    }
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-end gap-1" onBlur={handleBlur} tabIndex={0}>
      <MultilineTextField
        autoFocus
        className="min-h-fit overflow-hidden p-1.5"
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        value={content}
        withHeightAutoResize={true}
      />
      <IconButton
        className="my-auto"
        disabled={isWritePending || isNoContent}
        onClick={handleAddComment}
        size="md"
      >
        <BsArrowUpCircleFill className="size-5" />
      </IconButton>
    </div>
  );
};
