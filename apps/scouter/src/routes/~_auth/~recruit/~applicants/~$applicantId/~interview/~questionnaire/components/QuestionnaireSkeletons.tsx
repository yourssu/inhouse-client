import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

import { Paper } from '@/components/Paper';

export const DocumentReferencePanelSkeleton = () => {
  return (
    <Paper
      aria-busy="true"
      aria-label="지원서와 코멘트 불러오는 중"
      className="min-h-150 min-w-0 flex-1 gap-4"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <DocumentAnswerSkeleton key={index} />
        ))}
      </div>

      <div className="relative w-68 shrink-0">
        <div className="sticky top-3 flex flex-col gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <CommentThreadSkeleton key={index} />
          ))}
        </div>
      </div>
    </Paper>
  );
};

export const QuestionnairePanelSkeleton = () => {
  return (
    <Paper
      aria-busy="true"
      aria-label="질문지 불러오는 중"
      className="max-h-[calc(100vh-1.5rem)] min-h-150 w-full flex-col gap-6 overflow-hidden p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <SkeletonBlock className="h-7 w-28" />
        <SkeletonBlock className="h-6 w-10 rounded-full" />
      </header>

      <div className="flex flex-col gap-4">
        <QuestionnaireSectionHeaderSkeleton />

        <div className="flex flex-col gap-2">
          <QuestionnaireSectionHeaderSkeleton hasDescription />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <QuestionCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export const QuestionnairePageSkeleton = () => {
  return (
    <PageLayout.Content className="self-start py-7!" maxWidth="full">
      <div aria-busy="true" aria-label="질문지 설계 화면 불러오는 중">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="size-12 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-col gap-2">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-7 w-36" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {infoItemSkeletons.map(({ key, labelClassName, valueClassName }) => (
              <InfoItemSkeleton
                key={key}
                labelClassName={labelClassName}
                valueClassName={valueClassName}
              />
            ))}
          </div>
        </header>

        <main className="flex min-w-0 gap-4 pt-7">
          <section className="min-w-0 flex-1">
            <DocumentReferencePanelSkeleton />
          </section>
          <aside className="sticky top-3 h-fit w-100 shrink-0">
            <QuestionnairePanelSkeleton />
          </aside>
        </main>
      </div>
    </PageLayout.Content>
  );
};

const DocumentAnswerSkeleton = () => {
  return (
    <div className="flex h-fit w-full flex-col gap-3 p-5">
      <div className="flex items-start gap-2">
        <SkeletonBlock className="rounded-6 size-7 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-9">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
    </div>
  );
};

const CommentThreadSkeleton = () => {
  return (
    <div className="border-greyOpacity200 rounded-8 flex flex-col gap-3 border p-4">
      <div className="flex items-center gap-1">
        <SkeletonBlock className="h-3.5 w-24" />
        <SkeletonBlock className="h-3 w-10" />
      </div>
      <div className="flex flex-col gap-2 pl-1">
        <SkeletonBlock className="h-3.5 w-full" />
        <SkeletonBlock className="h-3.5 w-4/5" />
      </div>
    </div>
  );
};

interface QuestionnaireSectionHeaderSkeletonProps {
  hasDescription?: boolean;
}

const QuestionnaireSectionHeaderSkeleton = ({
  hasDescription = false,
}: QuestionnaireSectionHeaderSkeletonProps) => {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-9 rounded-full" />
        </div>
        {hasDescription && <SkeletonBlock className="mt-1.5 h-3 w-56" />}
      </div>
      <SkeletonBlock className="size-5 shrink-0" />
    </div>
  );
};

const QuestionCardSkeleton = () => {
  return (
    <div className="border-greyOpacity200 rounded-10 flex flex-col gap-2 border px-4 py-3">
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock className="h-3 w-10" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
    </div>
  );
};

interface InfoItemSkeletonProps {
  labelClassName: string;
  valueClassName: string;
}

const InfoItemSkeleton = ({ labelClassName, valueClassName }: InfoItemSkeletonProps) => {
  return (
    <div className="border-greyOpacity200 flex items-center gap-2.5 not-first-of-type:border-l not-first-of-type:pl-3">
      <SkeletonBlock className={cn('h-3.5', labelClassName)} />
      <SkeletonBlock className={cn('h-4', valueClassName)} />
    </div>
  );
};

const SkeletonBlock = ({ className }: { className: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-greyOpacity100 rounded-8 animate-pulse motion-reduce:animate-none',
        className,
      )}
    />
  );
};

const infoItemSkeletons = [
  { key: 'part', labelClassName: 'w-10', valueClassName: 'w-14' },
  { key: 'state', labelClassName: 'w-12', valueClassName: 'w-14' },
  { key: 'studentId', labelClassName: 'w-6', valueClassName: 'w-16' },
  { key: 'department', labelClassName: 'w-6', valueClassName: 'w-20' },
  { key: 'semester', labelClassName: 'w-12', valueClassName: 'w-16' },
  { key: 'age', labelClassName: 'w-6', valueClassName: 'w-8' },
  { key: 'applicationDate', labelClassName: 'w-10', valueClassName: 'w-20' },
];
