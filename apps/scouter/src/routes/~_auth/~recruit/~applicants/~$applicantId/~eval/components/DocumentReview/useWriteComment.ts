import { type KeyboardEvent, useRef, useState } from 'react';

export interface CommentCreatedMetadata {
  parentCommentId: null | number;
  sectionId: number;
}

export interface CommentWriteParams {
  content: string;
  onError: () => void;
  parentCommentId: null | number;
  sectionId: number;
}

interface UseWriteCommentParams {
  onClose: () => void;
  onCommentSubmit: (params: CommentWriteParams) => void;
  parentCommentId: null | number;
  sectionId: number;
}

export const useWriteComment = ({
  onClose,
  onCommentSubmit,
  parentCommentId,
  sectionId,
}: UseWriteCommentParams) => {
  const [content, setContent] = useState('');
  const latestSubmissionIdRef = useRef(0);
  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent === '';

  const handleAddComment = () => {
    if (isContentEmpty) {
      return;
    }

    const submissionId = latestSubmissionIdRef.current + 1;
    latestSubmissionIdRef.current = submissionId;
    onCommentSubmit({
      content: trimmedContent,
      onError: () => {
        if (latestSubmissionIdRef.current !== submissionId) {
          return;
        }
        setContent((currentContent) => (currentContent === '' ? trimmedContent : currentContent));
      },
      parentCommentId,
      sectionId,
    });
    setContent('');
  };

  const handleClose = () => {
    if (!isContentEmpty) {
      return;
    }
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }
      if (e.nativeEvent.isComposing) {
        return;
      }
      e.preventDefault();
      if (!isContentEmpty) {
        handleAddComment();
      }
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return {
    content,
    handleAddComment,
    handleClose,
    handleKeyDown,
    isContentEmpty,
    setContent,
  };
};
