import { useEffect, useMemo, useRef, useState } from 'react';

import type { ApplicantDocumentAnswersType } from '@/apis/applicants/schema';
import type { CommentType } from '@/apis/documents/schema';

import { Paper } from '@/components/Paper';

import type { CommentCreatedMetadata } from './useWriteComment';

import { CommentField } from './CommentField';
import { CommentThread } from './CommentThread';
import { DocumentAnswer } from './DocumentAnswer';
import { groupCommentThreads } from './groupCommentThreads';

interface DocumentReviewProps {
  answers: ApplicantDocumentAnswersType;
  applicantId: number;
  comments: readonly CommentType[];
  onCommentAddClick?: () => void;
  onCommentCreated?: (metadata: CommentCreatedMetadata) => void;
}

export const DocumentReview = ({
  applicantId,
  answers,
  comments,
  onCommentAddClick,
  onCommentCreated,
}: DocumentReviewProps) => {
  const [selectedSectionId, setSelectedSectionId] = useState<null | number>(null);
  const [openCommentSectionId, setOpenCommentSectionId] = useState<null | number>(null);
  const threadsBySectionId = useMemo(() => groupCommentThreads(comments), [comments]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());
  const showCommentPanel = comments.length > 0 || openCommentSectionId !== null;

  const handleClickSection = (sectionId: number) => {
    setSelectedSectionId((previousSectionId) =>
      previousSectionId === sectionId ? null : sectionId,
    );
  };

  const handleAddComment = (sectionId: number) => {
    onCommentAddClick?.();
    setSelectedSectionId(sectionId);
    setOpenCommentSectionId(sectionId);
  };

  const registerSectionRef = (sectionId: number) => (element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(sectionId, element);
    } else {
      sectionRefs.current.delete(sectionId);
    }
  };

  useEffect(() => {
    if (selectedSectionId === null) {
      return;
    }

    const containerElement = scrollContainerRef.current;
    const targetElement = sectionRefs.current.get(selectedSectionId);
    if (!containerElement || !targetElement) {
      return;
    }

    const containerRect = containerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const nextScrollTop = containerElement.scrollTop + targetRect.top - containerRect.top;
    containerElement.scrollTo({ behavior: 'smooth', top: nextScrollTop });
  }, [selectedSectionId]);

  return (
    <Paper className="min-h-0 flex-[1_1_0] gap-4 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-[3_1_0] flex-col gap-4 overflow-y-auto">
        {answers.map((answer, index) => {
          const { sectionId } = answer;

          return (
            <DocumentAnswer
              documentAnswer={answer}
              isSelected={sectionId !== undefined && sectionId === selectedSectionId}
              key={sectionId ?? `${answer.question}-${index}`}
              onAddComment={sectionId === undefined ? undefined : () => handleAddComment(sectionId)}
              onClick={sectionId === undefined ? undefined : () => handleClickSection(sectionId)}
              questionNumber={index + 1}
            />
          );
        })}
      </div>

      {showCommentPanel && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="-mx-4 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4"
            ref={scrollContainerRef}
          >
            {answers.flatMap(({ sectionId }) => {
              if (sectionId === undefined) {
                return [];
              }

              const threads = threadsBySectionId.get(sectionId) ?? [];

              return (
                <div
                  className="flex flex-col gap-5"
                  key={sectionId}
                  ref={registerSectionRef(sectionId)}
                >
                  {openCommentSectionId === sectionId && (
                    <CommentField
                      applicantId={applicantId}
                      onClose={() => setOpenCommentSectionId(null)}
                      onCommentCreated={onCommentCreated}
                      parentCommentId={null}
                      sectionId={sectionId}
                    />
                  )}
                  {threads.map((thread) => (
                    <CommentThread
                      applicantId={applicantId}
                      isSelected={sectionId === selectedSectionId}
                      key={thread[0].commentId}
                      onCommentCreated={onCommentCreated}
                      thread={thread}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Paper>
  );
};
