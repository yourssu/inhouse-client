import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type KeyboardEvent, useState } from 'react';

import type { CommentType } from '@/apis/documents/schema';

import { postApplicantDocumentComment } from '@/apis/documents';
import { commentsQueryKey } from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

export interface CommentCreatedMetadata {
  parentCommentId: null | number;
  sectionId: number;
}

let nextOptimisticCommentId = -1;

interface UseWriteCommentParams {
  applicantId: number;
  onClose: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  onOptimisticCommentCreate: (comment: CommentType) => void;
  onOptimisticCommentCreateSettled: (commentId: number) => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const useWriteComment = ({
  applicantId,
  onClose,
  onCommentCreated,
  onOptimisticCommentCreate,
  onOptimisticCommentCreateSettled,
  parentCommentId,
  sectionId,
}: UseWriteCommentParams) => {
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(meOption());
  const [content, setContent] = useState('');
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';

  const { isPending: isWritePending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationFn: postApplicantDocumentComment,
    successText: '코멘트를 작성했어요.',
    onMutate: ({ data }) => {
      const comment = {
        author: {
          nickname: me.nickname,
          part: me.parts[0]?.part ?? '',
          userId: me.userId,
        },
        commentId: nextOptimisticCommentId--,
        content: data.content,
        createdAt: new Date().toISOString(),
        isEdited: false,
        parentCommentId: data.parentCommentId ?? null,
        sectionId: data.sectionId,
      };
      onOptimisticCommentCreate(comment);
      setContent('');
      return { comment, content: data.content };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        onOptimisticCommentCreateSettled(context.comment.commentId);
        setContent(context.content);
      }
    },
    onSuccess: (_data, { applicantId: targetApplicantId }, context) => {
      onCommentCreated?.({ parentCommentId, sectionId });
      void queryClient
        .invalidateQueries({ queryKey: commentsQueryKey(targetApplicantId) })
        .then(() => {
          if (context) {
            onOptimisticCommentCreateSettled(context.comment.commentId);
          }
        });
    },
  });

  const handleAddComment = async () => {
    if (isContentEmpty || isWritePending) {
      return;
    }

    await writeCommentWithToast({
      applicantId,
      data: {
        content: trimmedContent,
        ...(parentCommentId === null ? {} : { parentCommentId }),
        sectionId,
      },
    });
  };

  const handleClose = () => {
    if (!isContentEmpty) {
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
      if (!isContentEmpty && !isWritePending) {
        void handleAddComment();
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
