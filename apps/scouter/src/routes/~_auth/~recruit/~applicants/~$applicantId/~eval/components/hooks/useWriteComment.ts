import { useQueryClient } from '@tanstack/react-query';
import { type KeyboardEvent, useState } from 'react';

import { postApplicantDocumentComment } from '@/apis/documents';
import { commentsQueryKey } from '@/apis/documents/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface UseWriteCommentParams {
  applicantId: number;
  onClose: () => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const useWriteComment = ({
  applicantId,
  onClose,
  parentCommentId,
  sectionId,
}: UseWriteCommentParams) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const isContentEmpty = content === '';

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
      data: { content, ...(parentCommentId === null ? {} : { parentCommentId }), sectionId },
    });

    setContent('');
  };

  const handleClose = () => {
    if (!isContentEmpty) {
      return;
    }
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isContentEmpty && !isWritePending) {
        handleAddComment();
      }
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return {
    content,
    handleAddComment,
    handleClose,
    handleKeyDown,
    isContentEmpty,
    isWritePending,
    setContent,
  };
};
