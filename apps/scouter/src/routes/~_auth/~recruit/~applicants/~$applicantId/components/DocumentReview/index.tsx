import { Button } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { compareAsc } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PiPlus } from 'react-icons/pi';

import type {
  ApplicantAnswerSectionType,
  ApplicantDocumentAnswersType,
} from '@/apis/applicants/schema';
import type { CommentType } from '@/apis/documents/schema';

import { Paper } from '@/components/Paper';

import { CommentField } from './CommentField';
import { CommentThread } from './CommentThread';

type CommentThreadType = CommentType[];

interface DocumentReviewProps {
  answers: ApplicantDocumentAnswersType;
  applicantId: number;
  comments: readonly CommentType[];
}

export const DocumentReview = ({ applicantId, answers, comments }: DocumentReviewProps) => {
  const [selectedSectionId, setSelectedSectionId] = useState<null | number>(null);
  const [openCommentSectionId, setOpenCommentSectionId] = useState<null | number>(null);
  const threadsBySectionId = useMemo(() => groupThreadsBySection(comments), [comments]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());

  const handleClickSection = (sectionId: number) => {
    setSelectedSectionId((previousSectionId) =>
      previousSectionId === sectionId ? null : sectionId,
    );
  };

  const handleAddComment = (sectionId: number) => {
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
    <Paper className="flex-[1_1_0] gap-4">
      <div className="flex flex-col gap-4">
        {answers.map((answer, index) => {
          const { sectionId } = answer;

          return (
            <DocumentAnswer
              documentAnswer={answer}
              isSelected={sectionId !== undefined && sectionId === selectedSectionId}
              key={sectionId ?? `${answer.question}-${index}`}
              onAddComment={sectionId === undefined ? undefined : () => handleAddComment(sectionId)}
              onClick={sectionId === undefined ? undefined : () => handleClickSection(sectionId)}
            />
          );
        })}
      </div>

      <div className="relative">
        <div
          className="sticky top-3 -mx-4 flex max-h-[calc(100vh-1.5rem)] flex-col gap-5 overflow-y-auto px-4"
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
                    parentCommentId={null}
                    sectionId={sectionId}
                  />
                )}
                {threads.map((thread) => (
                  <CommentThread
                    applicantId={applicantId}
                    isSelected={sectionId === selectedSectionId}
                    key={thread[0].commentId}
                    thread={thread}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Paper>
  );
};

interface DocumentAnswerProps {
  documentAnswer: ApplicantAnswerSectionType;
  isSelected: boolean;
  onAddComment?: () => void;
  onClick?: () => void;
}

const DocumentAnswer = ({
  documentAnswer,
  isSelected,
  onAddComment,
  onClick,
}: DocumentAnswerProps) => {
  const { sectionId, question, answer } = documentAnswer;

  return (
    <div
      className={clsx(
        'rounded-8 hover:border-violet200 flex h-fit w-full cursor-pointer flex-col gap-3 border border-transparent p-5',
        isSelected && 'bg-violet50 border-violet300 border',
      )}
      onClick={onClick}
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-violet50 text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center self-start text-sm font-semibold">
            {sectionId ?? '-'}
          </span>
          <span className="text-neutralMuted text-17 font-semibold">{question}</span>
        </div>

        {onAddComment && (
          <Button
            className="shrink-0"
            left={<PiPlus />}
            onClick={(event) => {
              event.stopPropagation();
              onAddComment();
            }}
            size="xxs"
            variant="subPrimary"
          >
            댓글
          </Button>
        )}
      </div>

      <p className="text-neutral pl-9 whitespace-pre-wrap">{answer}</p>
    </div>
  );
};

const isThreadStart = (comment: CommentType, commentById: Map<number, CommentType>): boolean =>
  comment.parentCommentId === null || !commentById.has(comment.parentCommentId);

const compareCommentCreatedAt = (a: CommentType, b: CommentType) => {
  if (!a.createdAt) {
    return b.createdAt ? 1 : 0;
  }
  if (!b.createdAt) {
    return -1;
  }
  return compareAsc(a.createdAt, b.createdAt);
};

const groupThreadsBySection = (
  comments: readonly CommentType[],
): Map<number, CommentThreadType[]> => {
  const commentById = new Map(comments.map((comment) => [comment.commentId, comment]));
  const repliesByParentId = new Map<number, CommentType[]>();

  for (const comment of comments) {
    if (comment.parentCommentId !== null) {
      const replies = repliesByParentId.get(comment.parentCommentId) ?? [];
      replies.push(comment);
      repliesByParentId.set(comment.parentCommentId, replies);
    }
  }

  const threadsBySection = new Map<number, CommentThreadType[]>();

  for (const comment of comments) {
    if (!isThreadStart(comment, commentById)) {
      continue;
    }

    const replies = (repliesByParentId.get(comment.commentId) ?? [])
      .slice()
      .sort(compareCommentCreatedAt);
    const sectionThreads = threadsBySection.get(comment.sectionId) ?? [];
    sectionThreads.push([comment, ...replies]);
    threadsBySection.set(comment.sectionId, sectionThreads);
  }

  for (const sectionThreads of threadsBySection.values()) {
    sectionThreads.sort((a, b) => compareCommentCreatedAt(a[0], b[0]));
  }

  return threadsBySection;
};
