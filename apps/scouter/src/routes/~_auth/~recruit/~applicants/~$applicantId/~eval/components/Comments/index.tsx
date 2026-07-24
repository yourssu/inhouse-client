import { useQueryClient } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton, Menu } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { HiOutlineTrash } from 'react-icons/hi2';
import { IoIosMore } from 'react-icons/io';

import type { CommentType } from '@/apis/eval/comments/schema';

import { deleteApplicantDocumentComment } from '@/apis/eval/comments';
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
      </div>
      <p className="text-13 min-h-fit border-transparent p-0 pl-1 whitespace-pre-wrap">{content}</p>
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
