import type { Key, ReactNode } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, Button } from '@yourssu-inhouse/interior';
import { MdAdd, MdKeyboardArrowDown } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';

import { isInterviewQuestionnaireActionAllowed } from '@/types/applicants';

interface QuestionSectionProps<TQuestion extends { id: Key }> {
  applicant: ApplicantType;
  description: string;
  onAddQuestion?: () => void;
  onOpenChange: (isOpen: boolean) => void;
  open: boolean;
  questions: TQuestion[];
  renderQuestion: (question: TQuestion, index: number) => ReactNode;
  title: string;
}

export const QuestionSection = <TQuestion extends { id: Key }>({
  applicant,
  description,
  onAddQuestion,
  onOpenChange,
  open,
  questions,
  renderQuestion,
  title,
}: QuestionSectionProps<TQuestion>) => {
  const { state } = applicant;
  const isActionAllowed = isInterviewQuestionnaireActionAllowed(state);
  return (
    <Collapsible.Root className="flex flex-col gap-2" onOpenChange={onOpenChange} open={open}>
      <h3>
        <Collapsible.Trigger asChild>
          <button
            className="group hover:bg-greyOpacity50 focus-visible:outline-violet500 rounded-10 flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            type="button"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-semibold">{title}</span>
                <Badge color="grey" size="sm">
                  {questions.length}개
                </Badge>
              </span>
              <span className="text-neutralSubtle mt-0.5 block text-xs">{description}</span>
            </span>
            <MdKeyboardArrowDown
              aria-hidden
              className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
          </button>
        </Collapsible.Trigger>
      </h3>

      <Collapsible.Content className="data-[state=closed]:hidden" forceMount>
        <div className="flex flex-col gap-3">
          {questions.length === 0 ? (
            <p className="text-neutralSubtle px-4 py-6 text-center text-sm">
              등록된 질문이 없어요.
            </p>
          ) : (
            <ol className="flex flex-col gap-3" role="list">
              {questions.map((question, index) => (
                <li key={question.id}>{renderQuestion(question, index)}</li>
              ))}
            </ol>
          )}

          {onAddQuestion !== undefined && (
            <Button
              className="w-full"
              disabled={!isActionAllowed}
              onClick={onAddQuestion}
              size="sm"
              type="button"
              variant="secondary"
            >
              <span className="flex items-center justify-center gap-1">
                <MdAdd aria-hidden className="size-3.5" />
                질문 추가
              </span>
            </Button>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
