import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import type { CommentType } from '@/apis/documents/schema';

import { DetectOutsideClickArea } from '../DetectOutsideClickArea';
import { useWriteComment } from '../useWriteComment';
import { Comment } from './Comment';

interface CommentThreadProps {
  applicantId: number;
  isSelected: boolean;
  thread: CommentType[];
}

export const CommentThread = ({ applicantId, isSelected, thread }: CommentThreadProps) => {
  const { sectionId, commentId: currentThreadId } = thread[0];
  const [isReplying, setIsReplying] = useState(false);

  const {
    content,
    handleAddComment,
    handleClose,
    handleKeyDown,
    isContentEmpty,
    isWritePending,
    setContent,
  } = useWriteComment({
    applicantId,
    onClose: () => setIsReplying(false),
    parentCommentId: currentThreadId,
    sectionId,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isContentEmpty && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [isContentEmpty]);

  return (
    <DetectOutsideClickArea onClickOutside={handleClose}>
      <div
        className={clsx(
          'rounded-8 hover:bg-grey50 relative left-0 z-10 flex flex-col gap-3 border p-4 transition-[left] hover:-left-1',
          isSelected ? 'border-violet300' : 'border-grey200',
        )}
        onClick={() => setIsReplying(true)}
      >
        {thread.map((comment) => (
          <Comment key={comment.commentId} {...comment} applicantId={applicantId} />
        ))}
        {isReplying && (
          <div className="flex items-end gap-1">
            <MultilineTextField
              autoFocus
              className="min-h-fit overflow-hidden p-1.5"
              disabled={isWritePending}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={'댓글 추가'}
              ref={textareaRef}
              rows={1}
              value={content}
              withHeightAutoResize={true}
            />
            <IconButton
              aria-label="답글 등록"
              className="my-auto"
              disabled={isWritePending || isContentEmpty}
              onClick={handleAddComment}
              size="md"
            >
              <BsArrowUpCircleFill className="size-5" />
            </IconButton>
          </div>
        )}
      </div>
    </DetectOutsideClickArea>
  );
};
