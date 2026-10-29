import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef, useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import type { CommentType } from '@/apis/documents/schema';

import type { CommentWriteParams } from '../useCommentComposer';

import { DetectOutsideClickArea } from '../DetectOutsideClickArea';
import { useCommentComposer } from '../useCommentComposer';
import { Comment, PendingComment } from './Comment';
import { CommentThreadCard } from './CommentThreadCard';

interface CommentThreadProps {
  applicantId: number;
  isSelected: boolean;
  onCommentCreate: (params: CommentWriteParams) => void;
  pendingCommentIds: ReadonlySet<number>;
  pendingComments: readonly {
    comment: Omit<CommentType, 'commentId'>;
    mutationId: number;
  }[];
  thread: CommentType[];
}

export const CommentThread = ({
  applicantId,
  isSelected,
  onCommentCreate,
  pendingCommentIds,
  pendingComments,
  thread,
}: CommentThreadProps) => {
  const { sectionId, commentId: currentThreadId } = thread[0];
  const [isReplying, setIsReplying] = useState(false);

  const { content, handleAddComment, handleClose, handleKeyDown, isContentEmpty, setContent } =
    useCommentComposer({
      onClose: () => setIsReplying(false),
      onCommentCreate,
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
          isOperationPending={pendingCommentIds.has(currentThreadId)}
        >
          {thread.slice(1).map((comment) => (
            <Comment
              {...comment}
              applicantId={applicantId}
              isOperationPending={pendingCommentIds.has(comment.commentId)}
              key={comment.commentId}
            />
          ))}
          {pendingComments.map(({ comment, mutationId }) =>
            comment.parentCommentId === currentThreadId ? (
              <PendingComment comment={comment} key={`pending:${mutationId}`} />
            ) : null,
          )}
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
                disabled={isContentEmpty}
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
