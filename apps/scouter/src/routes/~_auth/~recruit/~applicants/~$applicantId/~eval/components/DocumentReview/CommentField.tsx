import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import type { CommentCreatedMetadata } from './useWriteComment';

import { DetectOutsideClickArea } from './DetectOutsideClickArea';
import { useWriteComment } from './useWriteComment';

interface CommentFieldProps {
  applicantId: number;
  onClose: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const CommentField = ({
  applicantId,
  onClose,
  onCommentCreated,
  parentCommentId,
  sectionId,
}: CommentFieldProps) => {
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
    onClose,
    onCommentCreated,
    parentCommentId,
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
          aria-label="댓글 등록"
          disabled={isWritePending || isContentEmpty}
          onClick={handleAddComment}
          size="md"
        >
          <BsArrowUpCircleFill className="size-5" />
        </IconButton>
      </div>
    </DetectOutsideClickArea>
  );
};
