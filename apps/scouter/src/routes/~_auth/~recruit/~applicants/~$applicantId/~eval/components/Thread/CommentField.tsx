import type { KeyboardEvent } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { IconButton, MultilineTextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { BsArrowUpCircleFill } from 'react-icons/bs';

import { postApplicantDocumentComment } from '@/apis/eval/comments';
import { commentsQueryKey } from '@/apis/eval/comments/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';

import { DetectOutsideClickArea } from './DetectOutsideClickArea';

interface CommentFieldProps {
  applicantId: number;
  extraContainers?: (HTMLElement | null)[];
  onClose?: () => void;
  parentCommentId: null | number;
  placeholder: string;
  sectionId: number;
}

export const CommentField = ({
  placeholder,
  applicantId,
  parentCommentId,
  sectionId,
  onClose,
  extraContainers,
}: CommentFieldProps) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const isContentEmpty = content === '';

  const { isPending: isWritePending, mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationFn: postApplicantDocumentComment,
    successText: '코멘트를 작성했어요.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
    },
  });

  const handleAddComment = () => {
    writeCommentWithToast({
      applicantId,
      data: { content, sectionId, parentCommentId },
    });

    setContent('');
  };

  const handleOutsideClick = () => {
    if (!onClose || !isContentEmpty) {
      return;
    }
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isContentEmpty && !isWritePending) {
        handleAddComment();
      }
    }
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      handleOutsideClick();
    }
  };

  return (
    <DetectOutsideClickArea callback={handleOutsideClick} extraContainers={extraContainers}>
      <div className="flex items-end gap-1">
        <MultilineTextField
          autoFocus
          className="min-h-fit overflow-hidden p-1.5"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
