import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useEffect, useRef } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import type { CommentCreatedMetadata } from './useCommentComposer';

import { DetectOutsideClickArea } from './DetectOutsideClickArea';
import { useCommentComposer } from './useCommentComposer';

interface CommentFieldProps {
  applicantId: number;
  onClose: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
  sectionId: number;
}

export const CommentField = ({
  applicantId,
  onClose,
  onCommentCreated,
  sectionId,
}: CommentFieldProps) => {
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
    onClose,
    onCommentCreated,
    parentCommentId: null,
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
          disabled={isContentEmpty || isSubmitting}
          onClick={handleAddComment}
          size="md"
        >
          <BsArrowUpCircleFill className="size-5" />
        </IconButton>
      </div>
    </DetectOutsideClickArea>
  );
};
