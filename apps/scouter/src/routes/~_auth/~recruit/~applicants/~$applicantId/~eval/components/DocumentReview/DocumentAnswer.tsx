import { Button } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { PiPlus } from 'react-icons/pi';

import type { ApplicantAnswerSectionType } from '@/apis/applicants/schema';

interface DocumentAnswerProps {
  documentAnswer: ApplicantAnswerSectionType;
  isSelected: boolean;
  onAddComment?: () => void;
  onClick?: () => void;
  questionNumber: number;
}

export const DocumentAnswer = ({
  documentAnswer,
  isSelected,
  onAddComment,
  onClick,
  questionNumber,
}: DocumentAnswerProps) => {
  const { question, answer } = documentAnswer;

  return (
    <div
      className={clsx(
        'rounded-8 hover:border-violet200 flex h-fit w-full cursor-pointer flex-col gap-3 border border-transparent p-5',
        isSelected && 'bg-violet50 border-violet300 border',
      )}
      onClick={onClick}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-violet50 text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center self-start text-sm font-semibold">
            {questionNumber}
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
