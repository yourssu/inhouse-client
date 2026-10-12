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
  const mutationKey = createCommentMutationKey(applicantId, sectionId, parentCommentId);
  const { data: me } = useSuspenseQuery(meOption());
  const [content, setContent] = useState('');
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';

  const { isPending: isWritePending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationKey,
    mutationFn: postApplicantDocumentComment,
    successText: '코멘트를 작성했어요.',
    onMutate: async ({ applicantId, data }) => {
      const queryKey = commentsQueryKey(applicantId);
      await queryClient.cancelQueries({ queryKey });
      // 서버 ID와 구분해 조회로 확정되기 전의 수정·삭제·답글을 막는다.
      const optimisticComment: CommentType = {
        ...data,
        commentId: -Date.now(),
        author: {
          nickname: me.nickname,
          part: me.parts.map(({ part }) => part).join(', '),
          userId: me.userId,
        },
        isEdited: false,
        parentCommentId: data.parentCommentId ?? null,
      };
      queryClient.setQueryData<CommentType[]>(queryKey, (comments = []) => [
        ...comments,
        optimisticComment,
      ]);
      return optimisticComment;
    },
    onError: (_, { applicantId }, optimisticComment) => {
      queryClient.setQueryData<CommentType[]>(commentsQueryKey(applicantId), (comments) =>
        comments?.filter(({ commentId }) => commentId !== optimisticComment?.commentId),
      );
    },
    onSuccess: (_, { data }) => {
      setContent('');
      onCommentCreated?.({
        parentCommentId: data.parentCommentId ?? null,
        sectionId: data.sectionId,
      });
    },
    onSettled: (_, _error, { applicantId }) => {
      // 마지막 댓글 요청이 끝났을 때만 조회해 다른 임시 댓글이 지워지지 않게 한다.
      if (queryClient.isMutating({ mutationKey: commentsQueryKey(applicantId) }) === 1) {
        void queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
      }
    },
  });

  const handleAddComment = async () => {
    if (isContentEmpty || queryClient.isMutating({ mutationKey }) > 0) {
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
