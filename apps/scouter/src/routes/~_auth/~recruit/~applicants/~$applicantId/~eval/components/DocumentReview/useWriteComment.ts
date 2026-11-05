import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type KeyboardEvent, useState } from 'react';

import type { CommentType } from '@/apis/documents/schema';

import { postApplicantDocumentComment } from '@/apis/documents';
import { commentsQueryKey, createCommentMutationKey } from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

export interface CommentCreatedMetadata {
  parentCommentId: null | number;
  sectionId: number;
}

interface UseWriteCommentParams {
  applicantId: number;
  onClose: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const useWriteComment = ({
  applicantId,
  onClose,
  onCommentCreated,
  parentCommentId,
  sectionId,
}: UseWriteCommentParams) => {
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(meOption());
  const [content, setContent] = useState('');
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';

  const { isPending: isWritePending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationKey: createCommentMutationKey(applicantId),
    mutationFn: postApplicantDocumentComment,
    successText: '코멘트를 작성했어요.',
    onMutate: ({ data }): CommentType => {
      // 서버 ID와 구분해 조회로 확정되기 전의 수정·삭제·답글을 막는다.
      return {
        ...data,
        commentId: -Date.now(),
        author: {
          nickname: me.nickname.split('(')[0].trim(),
          part: me.parts.map(({ part }) => part).join(', '),
          userId: me.userId,
        },
        isEdited: false,
        parentCommentId: data.parentCommentId ?? null,
      };
    },
    onSuccess: (_, { data }) => {
      setContent('');
      onCommentCreated?.({
        parentCommentId: data.parentCommentId ?? null,
        sectionId: data.sectionId,
      });
    },
    // 재조회가 끝날 때까지 pending을 유지해 임시 댓글이 먼저 사라지지 않게 한다.
    onSettled: (_, _error, { applicantId }) =>
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) }),
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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleAddComment();
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
