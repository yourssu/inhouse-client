import type { KeyboardEvent } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton, Menu, MultilineTextField } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { IoIosCheckmarkCircle, IoIosMore } from 'react-icons/io';
import { MdCancel, MdEdit } from 'react-icons/md';

import type { CommentType } from '@/apis/eval/comments/schema';

import {
  deleteApplicantDocumentComment,
  patchApplicantDocumentComment,
} from '@/apis/eval/comments';
import { commentsQueryKey } from '@/apis/eval/comments/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

import type { CommentThread } from '../../utils/groupThreadsBySection';

interface CommentProps extends CommentType {
  applicantId: number;
}

export const Comment = ({
  content,
  author,
  createdAt,
  commentId,
  applicantId,
  isEdited,
}: CommentProps) => {
  const { nickname, part } = author;
  const leftTime = formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](new Date(createdAt));
  const openAlertDialog = useAlertDialog();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 코멘트 삭제
  const { isPending: isDeletePending, mutateWithToast: deleteCommentWithToast } =
    useToastedMutation({
      mutationFn: deleteApplicantDocumentComment,
      successText: '코멘트를 삭제했어요.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
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

  // 코멘트 수정
  const { isPending: isUpdatePending, mutateWithToast: updateCommentWithToast } =
    useToastedMutation({
      mutationFn: patchApplicantDocumentComment,
      successText: '코멘트를 수정했어요.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
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

    const { success } = await updateCommentWithToast({
      applicantId,
      commentId,
      data: { content: trimmedContent },
    });
    if (success) {
      setIsEditing(false);
    }
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

  return (
    <div className="group min-w-60 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-13 font-medium">
            {nickname} [{part}]
          </span>
          <span className="text-neutralSubtle text-xs">
            {isEdited ? `${leftTime} (편집됨)` : `${leftTime}`}
          </span>
        </div>
        <div className="ease-ease opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Menu>
            <Menu.Trigger>
              <IconButton className="rounded-4" size="xxs" variant="inline">
                <IoIosMore className="size-4" />
              </IconButton>
            </Menu.Trigger>
            <Menu.Content align="end">
              <Menu.ButtonItem
                className="text-13 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isEditing}
                icon={<MdEdit className="size-4" />}
                onClick={handleEdit}
              >
                편집하기
              </Menu.ButtonItem>
              <Menu.ButtonItem
                className="text-13 text-red600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isDeletePending || isEditing}
                icon={<HiOutlineTrash className="text-red600 size-4" />}
                onClick={handleDelete}
              >
                삭제하기
              </Menu.ButtonItem>
            </Menu.Content>
          </Menu>
        </div>
      </div>
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
              className="rounded-full"
              onClick={handleCancelEdit}
              onMouseDown={(e) => e.preventDefault()}
              size="xxs"
            >
              <MdCancel className="text-grey600 size-4.5" />
            </IconButton>
            <IconButton
              className="rounded-full"
              onClick={handleSubmitEdit}
              onMouseDown={(e) => e.preventDefault()}
              size="xxs"
            >
              <IoIosCheckmarkCircle className="text-violet600 size-4.5" />
            </IconButton>
          </div>
        </div>
      ) : (
        <p className="text-13 min-h-fit border-transparent p-0 pl-1 whitespace-pre-wrap">
          {content}
        </p>
      )}
    </div>
  );
};

interface CommentsProps {
  applicantId: number;
  onClick: () => void;
  selectedSectionId: null | number;
  thread: CommentThread;
}

export const Comments = ({ applicantId, selectedSectionId, thread, onClick }: CommentsProps) => {
  const sectionId = thread[0].sectionId;
  const isSelectedSection = sectionId === selectedSectionId;

  return (
    <div
      className={cn(
        'rounded-8 hover:bg-grey50 relative z-10 flex flex-col gap-3 border p-4 transition-transform hover:-translate-x-1',
        isSelectedSection ? 'border-violet300' : 'border-grey200',
      )}
      data-comments
      onClick={onClick}
    >
      {thread.map((comment) => (
        <Comment key={comment.commentId} {...comment} applicantId={applicantId} />
      ))}
    </div>
  );
};
