import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import {
  useIsMutating,
  useMutationState,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton, Menu, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { IoIosCheckmarkCircle, IoIosMore } from 'react-icons/io';
import { MdCancel, MdEdit } from 'react-icons/md';

import type { UpdateCommentParams } from '@/apis/documents';
import type { CommentType } from '@/apis/documents/schema';

import { deleteApplicantDocumentComment, patchApplicantDocumentComment } from '@/apis/documents';
import { changeCommentMutationKey, commentsQueryKey } from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface CommentProps extends CommentType {
  applicantId: number;
  isDeleteDisabled: boolean;
  isParentDeleting: boolean;
}

interface CommentItemProps {
  actions?: ReactNode;
  children: ReactNode;
  comment: CommentType;
  isCreatePending: boolean;
}

interface CommentBodyProps {
  children: ReactNode;
}

export const Comment = ({
  applicantId,
  isDeleteDisabled,
  isParentDeleting,
  ...comment
}: CommentProps) => {
  const { author, commentId, content } = comment;
  const { userId } = author;
  const { data: myData } = useSuspenseQuery(meOption());
  const isMyComment = userId === myData.userId;
  const { invalidate: invalidateComments } = useQueryInvalidation(commentsQueryKey(applicantId));
  const queryClient = useQueryClient();
  const queryKey = commentsQueryKey(applicantId);
  const mutationKey = changeCommentMutationKey(applicantId, commentId);
  const isCreatePending =
    useIsMutating({
      mutationKey: queryKey,
      predicate: ({ state }) => (state.context as CommentType | undefined)?.commentId === commentId,
    }) > 0;
  const isDeletePending =
    useIsMutating({
      mutationKey: changeCommentMutationKey(applicantId, commentId, 'delete'),
    }) > 0;
  const [pendingEdit] = useMutationState({
    filters: {
      mutationKey: changeCommentMutationKey(applicantId, commentId, 'update'),
      status: 'pending',
    },
    // 페이지가 바뀌어도 같은 키로 전송 중인 수정 내용을 표시한다.
    select: ({ state }) => (state.variables as UpdateCommentParams).data.content,
  });
  const isChanging =
    commentId < 0 || pendingEdit !== undefined || isDeletePending || isParentDeleting;

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusEditRef = useRef(false);

  const { mutateWithToast: updateCommentWithToast } = useToastedMutation({
    mutationKey: changeCommentMutationKey(applicantId, commentId, 'update'),
    mutationFn: patchApplicantDocumentComment,
    successText: '코멘트를 수정했어요.',
    onSuccess: (updatedComment) => {
      queryClient.setQueryData<CommentType[]>(queryKey, (comments) =>
        comments?.map((item) => (item.commentId === commentId ? updatedComment : item)),
      );
    },
    onError: (_, { data }) => {
      shouldFocusEditRef.current = false;
      setEditedContent(data.content);
      setIsEditing(true);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: queryKey }) === 1) {
        void invalidateComments();
      }
    },
  });

  useEffect(() => {
    const textarea = editTextareaRef.current;
    if (isEditing && textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      if (shouldFocusEditRef.current) {
        textarea.focus();
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    shouldFocusEditRef.current = true;
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSubmitEdit = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (isParentDeleting || queryClient.isMutating({ mutationKey }) > 0) {
      return;
    }

    const trimmedContent = editedContent.trim();
    if (trimmedContent === '' || trimmedContent === content) {
      setIsEditing(false);
      return;
    }

    setIsEditing(false);
    await updateCommentWithToast({
      applicantId,
      commentId,
      data: { content: trimmedContent },
    });
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const openAlertDialog = useAlertDialog();

  const { mutateWithToast: deleteCommentWithToast } = useToastedMutation({
    mutationKey: changeCommentMutationKey(applicantId, commentId, 'delete'),
    mutationFn: deleteApplicantDocumentComment,
    successText: '코멘트를 삭제했어요.',
    onSuccess: () => {
      queryClient.setQueryData<CommentType[]>(queryKey, (comments) =>
        comments?.filter((item) => item.commentId !== commentId),
      );
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: queryKey }) === 1) {
        void invalidateComments();
      }
    },
  });

  const handleDelete = async () => {
    if (isChanging || isDeleteDisabled) {
      return;
    }
    const isConfirm = await openAlertDialog({
      title: '코멘트를 삭제할까요?',
      content: '삭제한 코멘트는 복구할 수 없어요.',
      closeButton: true,
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm && queryClient.isMutating({ mutationKey }) === 0) {
      deleteCommentWithToast({ applicantId, commentId });
    }
  };

  if (isDeletePending) {
    return null;
  }

  const displayedComment =
    pendingEdit !== undefined ? { ...comment, content: pendingEdit, isEdited: true } : comment;

  return (
    <CommentItem
      actions={
        isMyComment && !isEditing ? (
          <div className="ease-ease opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Menu>
              <Menu.Trigger>
                <IconButton
                  aria-label="댓글 메뉴"
                  className="rounded-4"
                  size="xxs"
                  variant="inline"
                >
                  <IoIosMore className="size-4" />
                </IconButton>
              </Menu.Trigger>
              <Menu.Content align="end">
                <Menu.ButtonItem
                  className="text-13 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isChanging}
                  icon={<MdEdit className="size-4" />}
                  onClick={handleEdit}
                >
                  수정하기
                </Menu.ButtonItem>

                <Menu.ButtonItem
                  className="text-13 text-red600 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isChanging || isDeleteDisabled}
                  icon={<HiOutlineTrash className="text-red600 size-4" />}
                  onClick={handleDelete}
                >
                  삭제하기
                </Menu.ButtonItem>
              </Menu.Content>
            </Menu>
          </div>
        ) : undefined
      }
      comment={displayedComment}
      isCreatePending={isCreatePending}
    >
      {isEditing ? (
        <div className="flex flex-col gap-0.5">
          <MultilineTextField
            className="text-13 min-h-fit overflow-hidden p-0 pl-1"
            disabled={isChanging}
            onBlur={() => handleCancelEdit()}
            onChange={(e) => setEditedContent(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEditKeyDown}
            ref={editTextareaRef}
            rows={1}
            value={editedContent}
            withHeightAutoResize={true}
          />
          <div className="flex self-end">
            <IconButton
              aria-label="댓글 수정 취소"
              className="rounded-full"
              onClick={handleCancelEdit}
              onMouseDown={(e) => e.preventDefault()}
              size="xs"
            >
              <MdCancel className="text-grey600 size-5" />
            </IconButton>
            <IconButton
              aria-label="댓글 수정 저장"
              className="rounded-full"
              disabled={isChanging}
              onClick={handleSubmitEdit}
              onMouseDown={(e) => e.preventDefault()}
              size="xs"
            >
              <IoIosCheckmarkCircle className="text-violet600 size-5" />
            </IconButton>
          </div>
        </div>
      ) : (
        <CommentBody>{displayedComment.content}</CommentBody>
      )}
    </CommentItem>
  );
};

const CommentItem = ({ actions, children, comment, isCreatePending }: CommentItemProps) => {
  const { author, createdAt, isEdited } = comment;
  const relativeTime = createdAt
    ? formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](new Date(createdAt))
    : null;

  return (
    <div className={isCreatePending ? 'group text-neutralSubtle' : 'group'}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
          <span className="text-13 truncate font-medium">
            {author.nickname} [{author.part}]
          </span>
          {relativeTime && (
            <span className="text-neutralSubtle text-xs">
              {isEdited ? `${relativeTime} (편집됨)` : relativeTime}
            </span>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
};

const CommentBody = ({ children }: CommentBodyProps) => (
  <p className="text-13 min-h-fit border-transparent p-0 pl-1 wrap-break-word whitespace-pre-wrap">
    {children}
  </p>
);
