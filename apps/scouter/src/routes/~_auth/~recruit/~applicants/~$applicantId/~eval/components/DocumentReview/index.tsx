import { useMutationState, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Divider } from '@yourssu-inhouse/interior';
import { useEffect, useRef, useState } from 'react';

import type { ApplicantDocumentAnswersType } from '@/apis/applicants/schema';
import type { CommentType } from '@/apis/documents/schema';

import { postApplicantDocumentComment } from '@/apis/documents';
import { commentCreateMutationKey, commentsQueryKey } from '@/apis/documents/query';
import { CommentSchema } from '@/apis/documents/schema';
import { meOption } from '@/apis/members/query';
import { Paper } from '@/components/Paper';
import { useToastedMutation } from '@/hooks/useToastedMutation';

import type { CommentCreatedMetadata, CommentWriteParams } from './useCommentComposer';

import { CommentField } from './CommentField';
import { CommentThread } from './CommentThread';
import { PendingComment } from './CommentThread/Comment';
import { CommentThreadCard } from './CommentThread/CommentThreadCard';
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

type CommentWriteVariables = Omit<CommentType, 'commentId'> & {
  applicantId: number;
  onError: () => void;
};

const pendingCommentSchema = CommentSchema.omit({ commentId: true });

const normalizeNickname = (nickname: string) => nickname.replace(/\s*\([^)]*\)$/, '');

export const DocumentReview = ({
  applicantId,
  answers,
  comments,
  onCommentAddClick,
  onCommentCreated,
}: DocumentReviewProps) => {
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(meOption());
  const [selectedSectionId, setSelectedSectionId] = useState<null | number>(null);
  const [openCommentSectionId, setOpenCommentSectionId] = useState<null | number>(null);
  const mutationKey = commentCreateMutationKey(applicantId);
  const { mutateWithToast: writeCommentWithToast } = useToastedMutation({
    mutationKey,
    scope: { id: JSON.stringify(mutationKey) },
    mutationFn: ({ applicantId, content, parentCommentId, sectionId }: CommentWriteVariables) =>
      postApplicantDocumentComment({
        applicantId,
        data: {
          content,
          ...(parentCommentId === null ? {} : { parentCommentId }),
          sectionId,
        },
      }),
    onError: (_error, { onError }) => {
      onError();
    },
    onSuccess: async (_data, { applicantId, parentCommentId, sectionId }) => {
      onCommentCreated?.({ parentCommentId, sectionId });
      await queryClient.invalidateQueries({ queryKey: commentsQueryKey(applicantId) });
    },
    successText: '코멘트를 작성했어요.',
  });
  const optimisticComments = useMutationState({
    filters: { mutationKey, exact: true, status: 'pending' },
    select: (mutation) => ({
      comment: pendingCommentSchema.parse(mutation.state.variables),
      mutationId: mutation.mutationId,
    }),
  });
  const pendingCommentIds = new Set<number>();

  for (const {
    comment: { parentCommentId },
  } of optimisticComments) {
    if (parentCommentId !== null) {
      pendingCommentIds.add(parentCommentId);
    }
  }

  const threadsBySectionId = groupCommentThreads(comments);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());
  const showCommentPanel =
    comments.length > 0 || optimisticComments.length > 0 || openCommentSectionId !== null;

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

  const handleCommentCreate = ({
    content,
    onError,
    parentCommentId,
    sectionId,
  }: CommentWriteParams) => {
    void writeCommentWithToast({
      applicantId,
      author: {
        nickname: normalizeNickname(me.nickname),
        part: me.parts[0]?.part ?? '',
        userId: me.userId,
      },
      content,
      createdAt: new Date().toISOString(),
      isEdited: false,
      onError,
      parentCommentId,
      sectionId,
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
              const pendingComments = optimisticComments.filter(
                ({ comment }) => comment.sectionId === sectionId,
              );
              const pendingThreads = pendingComments.filter(
                ({ comment }) =>
                  comment.parentCommentId === null ||
                  !threads.some((thread) =>
                    thread.some(({ commentId }) => commentId === comment.parentCommentId),
                  ),
              );

              return (
                <div
                  className="flex flex-col gap-5"
                  key={sectionId}
                  ref={registerSectionRef(sectionId)}
                >
                  {(threads.length > 0 ||
                    pendingThreads.length > 0 ||
                    openCommentSectionId === sectionId) && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutralMuted shrink-0 text-sm font-medium">
                        {index + 1}번 문항
                      </span>
                      <Divider className="min-w-0 flex-1" />
                    </div>
                  )}
                  {openCommentSectionId === sectionId && (
                    <CommentField
                      onClose={() => setOpenCommentSectionId(null)}
                      onCommentCreate={handleCommentCreate}
                      parentCommentId={null}
                      sectionId={sectionId}
                    />
                  )}
                  {threads.map((thread) => (
                    <CommentThread
                      applicantId={applicantId}
                      isSelected={sectionId === selectedSectionId}
                      key={thread[0].commentId}
                      onCommentCreate={handleCommentCreate}
                      pendingCommentIds={pendingCommentIds}
                      pendingComments={pendingComments}
                      thread={thread}
                    />
                  ))}
                  {pendingThreads.map(({ comment, mutationId }) => (
                    <CommentThreadCard
                      isSelected={sectionId === selectedSectionId}
                      key={`pending:${mutationId}`}
                    >
                      <PendingComment comment={comment} />
                    </CommentThreadCard>
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
