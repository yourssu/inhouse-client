import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { type KeyboardEvent, useState } from 'react';

import type { CreateCommentRequestType } from '@/apis/documents/schema';

import { postApplicantDocumentComment } from '@/apis/documents';
import { commentCreateMutationKey, commentsQueryKey } from '@/apis/documents/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

export interface CommentCreatedMetadata {
  parentCommentId: null | number;
  sectionId: number;
}

interface UseCommentComposerParams {
  applicantId: number;
  onClose: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const useCommentComposer = ({
  applicantId,
  onClose,
  onCommentCreated,
  parentCommentId,
  sectionId,
}: UseCommentComposerParams) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const mutationKey = commentCreateMutationKey(applicantId);
  const isSubmitting = useIsMutating({ mutationKey, exact: true }) > 0;
  const { isPending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationKey,
    mutationFn: (data: CreateCommentRequestType) =>
      postApplicantDocumentComment({ applicantId, data }),
    onError: (_error, { content: submittedContent }) => {
      setContent((currentContent) => (currentContent === '' ? submittedContent : currentContent));
    },
    onSuccess: async (_data, { parentCommentId, sectionId }) => {
      onCommentCreated?.({ parentCommentId: parentCommentId ?? null, sectionId });
      await queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
    },
    successText: '코멘트를 작성했어요.',
  });
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';

  const handleAddComment = () => {
    if (isContentEmpty || queryClient.isMutating({ mutationKey, exact: true }) > 0) {
      return;
    }

    void writeCommentWithToast({
      content: trimmedContent,
      ...(parentCommentId === null ? {} : { parentCommentId }),
      sectionId,
    });
    setContent('');
  };

  const handleClose = () => {
    if (isPending || !isContentEmpty) {
      return;
    }
    onClose();
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
      handleAddComment();
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
    isSubmitting,
    setContent,
  };
};
