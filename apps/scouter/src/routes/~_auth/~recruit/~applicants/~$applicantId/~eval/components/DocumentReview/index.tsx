import { Divider } from '@yourssu-inhouse/interior';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ApplicantDocumentAnswersType } from '@/apis/applicants/schema';
import type { CommentType } from '@/apis/documents/schema';

import { Paper } from '@/components/Paper';

import type { CommentCreatedMetadata } from './useWriteComment';

import { CommentField } from './CommentField';
import { CommentThread } from './CommentThread';
import { DocumentAnswer } from './DocumentAnswer';
import { groupCommentThreads } from './groupCommentThreads';

export const DOCUMENT_REVIEW_PAGE_GRID_TEMPLATE_COLUMNS =
  'grid-cols-[minmax(36rem,1fr)_minmax(17.5rem,25rem)]';

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
  const [optimisticComments, setOptimisticComments] = useState<CommentType[]>([]);
  const [optimisticCommentContents, setOptimisticCommentContents] = useState<Map<number, string>>(
    new Map(),
  );
  const [optimisticallyDeletedCommentIds, setOptimisticallyDeletedCommentIds] = useState<
    Set<number>
  >(new Set());
  const displayedComments = useMemo(
    () => [
      ...comments
        .filter(({ commentId }) => !optimisticallyDeletedCommentIds.has(commentId))
        .map((comment) => {
          const content = optimisticCommentContents.get(comment.commentId);
          return content === undefined ? comment : { ...comment, content, isEdited: true };
        }),
      ...optimisticComments,
    ],
    [comments, optimisticCommentContents, optimisticComments, optimisticallyDeletedCommentIds],
  );
  const threadsBySectionId = useMemo(
    () => groupCommentThreads(displayedComments),
    [displayedComments],
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());
  const showCommentPanel = displayedComments.length > 0 || openCommentSectionId !== null;

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

  const handleOptimisticCommentCreate = (comment: CommentType) => {
    setOptimisticComments((comments) => [...comments, comment]);
  };

  const handleOptimisticCommentCreateSettled = (commentId: number) => {
    setOptimisticComments((comments) =>
      comments.filter((comment) => comment.commentId !== commentId),
    );
  };

  const handleOptimisticCommentUpdate = (commentId: number, content: string) => {
    setOptimisticCommentContents((contents) => new Map(contents).set(commentId, content));
  };

  const handleOptimisticCommentUpdateSettled = (commentId: number) => {
    setOptimisticCommentContents((contents) => {
      const nextContents = new Map(contents);
      nextContents.delete(commentId);
      return nextContents;
    });
  };

  const handleOptimisticCommentDelete = (commentId: number) => {
    setOptimisticallyDeletedCommentIds((commentIds) => new Set(commentIds).add(commentId));
  };

  const handleOptimisticCommentDeleteSettled = (commentId: number) => {
    setOptimisticallyDeletedCommentIds((commentIds) => {
      const nextCommentIds = new Set(commentIds);
      nextCommentIds.delete(commentId);
      return nextCommentIds;
    });
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
    <Paper className="grid min-h-0 grid-cols-3 grid-rows-1 gap-4 overflow-hidden">
      <div className="col-span-2 flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto only:col-span-full">
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
        <div className="col-span-1 flex min-h-0 flex-col">
          <div
            className="-mx-4 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4"
            ref={scrollContainerRef}
          >
            {answers.flatMap(({ sectionId }, index) => {
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
                  {(threads.length > 0 || openCommentSectionId === sectionId) && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutralMuted shrink-0 text-sm font-medium">
                        {index + 1}번 문항
                      </span>
                      <Divider className="min-w-0 flex-1" />
                    </div>
                  )}
                  {openCommentSectionId === sectionId && (
                    <CommentField
                      applicantId={applicantId}
                      onClose={() => setOpenCommentSectionId(null)}
                      onCommentCreated={onCommentCreated}
                      onOptimisticCommentCreate={handleOptimisticCommentCreate}
                      onOptimisticCommentCreateSettled={handleOptimisticCommentCreateSettled}
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
                      onOptimisticCommentCreate={handleOptimisticCommentCreate}
                      onOptimisticCommentCreateSettled={handleOptimisticCommentCreateSettled}
                      onOptimisticCommentDelete={handleOptimisticCommentDelete}
                      onOptimisticCommentDeleteSettled={handleOptimisticCommentDeleteSettled}
                      onOptimisticCommentUpdate={handleOptimisticCommentUpdate}
                      onOptimisticCommentUpdateSettled={handleOptimisticCommentUpdateSettled}
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
