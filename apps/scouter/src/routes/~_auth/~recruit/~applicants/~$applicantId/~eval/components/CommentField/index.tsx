import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import { DetectOutsideClickArea } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/DetectOutsideClickArea';
import { useWriteComment } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/hooks/useWriteComment';

interface CommentFieldProps {
  applicantId: number;
  onClose: () => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const CommentField = ({
  applicantId,
  onClose,
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
    parentCommentId,
    sectionId,
  });

  return (
    <DetectOutsideClickArea onClickOutside={handleClose}>
      <div className="flex items-end gap-1">
        <MultilineTextField
          autoFocus
          className="min-h-fit overflow-hidden p-1.5"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'댓글 추가'}
          rows={1}
          value={content}
          withHeightAutoResize={true}
        />
        <IconButton
          className="my-auto"
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
