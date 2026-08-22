import type { KeyboardEvent, ReactNode } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton, Menu, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { IoIosCheckmarkCircle, IoIosMore } from 'react-icons/io';
import { MdCancel, MdEdit } from 'react-icons/md';

import type { CommentType } from '@/apis/documents/schema';

import { deleteApplicantDocumentComment, patchApplicantDocumentComment } from '@/apis/documents';
import { commentsQueryKey } from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface CommentProps extends CommentType {
  applicantId: number;
}

interface CommentItemProps {
  actions?: ReactNode;
  children: ReactNode;
  comment: CommentType;
}

interface CommentBodyProps {
  children: ReactNode;
}

export const Comment = ({ applicantId, ...comment }: CommentProps) => {
  const { author, commentId, content } = comment;
  const { userId } = author;
  const { data: myData } = useSuspenseQuery(meOption());
  const isMyComment = userId === myData.userId;
  const { invalidate: invalidateComments } = useQueryInvalidation(commentsQueryKey(applicantId));

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { isPending: isUpdatePending, mutateWithToast: updateCommentWithToast } =
    useToastedMutation({
      mutationFn: patchApplicantDocumentComment,
      successText: '코멘트를 수정했어요.',
      onSuccess: () => {
        setIsEditing(false);
        invalidateComments();
      },
    });

  useEffect(() => {
    const textarea = editTextareaRef.current;
    if (isEditing && textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSubmitEdit = async () => {
    if (isUpdatePending) {
      return;
    }

    const trimmedContent = editedContent.trim();
    if (trimmedContent === '' || trimmedContent === content) {
      setIsEditing(false);
      return;
    }

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

  const { isPending: isDeletePending, mutateWithToast: deleteCommentWithToast } =
    useToastedMutation({
      mutationFn: deleteApplicantDocumentComment,
      successText: '코멘트를 삭제했어요.',
      onSuccess: () => {
        invalidateComments();
      },
    });

  const handleDelete = async () => {
    const isConfirm = await openAlertDialog({
      title: '코멘트를 삭제할까요?',
      content: '삭제한 코멘트는 복구할 수 없어요.',
      closeButton: true,
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm) {
      deleteCommentWithToast({ applicantId, commentId });
    }
  };

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
                  icon={<MdEdit className="size-4" />}
                  onClick={handleEdit}
                >
                  수정하기
                </Menu.ButtonItem>

                <Menu.ButtonItem
                  className="text-13 text-red600 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isDeletePending}
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
      comment={comment}
    >
      {isEditing ? (
        <div className="flex flex-col gap-0.5">
          <MultilineTextField
            autoFocus
            className="text-13 min-h-fit overflow-hidden p-0 pl-1"
            disabled={isUpdatePending}
            onBlur={handleCancelEdit}
            onChange={(e) => setEditedContent(e.target.value)}
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
              disabled={isUpdatePending}
              onClick={handleSubmitEdit}
              onMouseDown={(e) => e.preventDefault()}
              size="xs"
            >
              <IoIosCheckmarkCircle className="text-violet600 size-5" />
            </IconButton>
          </div>
        </div>
      ) : (
        <CommentBody>{content}</CommentBody>
      )}
    </CommentItem>
  );
};

const CommentItem = ({ actions, children, comment }: CommentItemProps) => {
  const { author, createdAt, isEdited } = comment;
  const relativeTime = createdAt
    ? formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](new Date(createdAt))
    : null;

  return (
    <div className="group min-w-60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-13 font-medium">
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
