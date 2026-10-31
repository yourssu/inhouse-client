import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef, useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import type { CommentType } from '@/apis/documents/schema';

import type { CommentCreatedMetadata } from '../useCommentComposer';

import { DetectOutsideClickArea } from '../DetectOutsideClickArea';
import { useCommentComposer } from '../useCommentComposer';
import { Comment, PendingComment } from './Comment';
import { CommentThreadCard } from './CommentThreadCard';

interface CommentThreadProps {
  applicantId: number;
  isSelected: boolean;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  pendingComment: null | Pick<CommentType, 'content' | 'parentCommentId'>;
  thread: CommentType[];
}

export const CommentThread = ({
  applicantId,
  isSelected,
  onCommentCreated,
  pendingComment,
  thread,
}: CommentThreadProps) => {
  const { sectionId, commentId: currentThreadId } = thread[0];
  const [isReplying, setIsReplying] = useState(false);
  const pendingReply = pendingComment?.parentCommentId === currentThreadId ? pendingComment : null;

  const {
    content,
    handleAddComment,
    handleClose,
    handleKeyDown,
    isContentEmpty,
    isSubmitting,
    setContent,
  } = useCommentComposer({
    applicantId,
    onClose: () => setIsReplying(false),
    onCommentCreated,
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
      <CommentThreadCard isSelected={isSelected} onClick={() => setIsReplying(true)}>
        <Comment
          {...thread[0]}
          applicantId={applicantId}
          isOperationPending={pendingReply !== null}
        >
          {thread.slice(1).map((comment) => (
            <Comment
              {...comment}
              applicantId={applicantId}
              isOperationPending={false}
              key={comment.commentId}
            />
          ))}
          {pendingReply && <PendingComment content={pendingReply.content} />}
          {isReplying && (
            <div className="flex items-end gap-1">
              <MultilineTextField
                autoFocus
                className="min-h-fit overflow-hidden p-1.5"
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
                disabled={isContentEmpty || isSubmitting}
                onClick={handleAddComment}
                size="md"
              >
                <BsArrowUpCircleFill className="size-5" />
              </IconButton>
            </div>
          )}
        </Comment>
      </CommentThreadCard>
    </DetectOutsideClickArea>
  );
};
