import { Button } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { PiPlus } from 'react-icons/pi';

import type { ApplicantAnswerSectionType } from '@/apis/applicants/schema';

interface AnswerProps extends ApplicantAnswerSectionType {
  isSelected: boolean;
  onAddComment: () => void;
  onClick: () => void;
}

export const Answer = ({
  sectionId,
  question,
  answer,
  isSelected,
  onClick,
  onAddComment,
}: AnswerProps) => {
  return (
    <div
      className={clsx(
        'rounded-8 hover:border-violet200 flex h-fit w-full cursor-pointer flex-col gap-3 border border-transparent p-5',
        isSelected && 'bg-violet50 border-violet300 border',
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-violet50 text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center self-start text-sm font-semibold">
            {sectionId}
          </span>
          <span className="text-neutralMuted text-17 font-semibold">{question}</span>
        </div>

        <Button
          className="self-start"
          left={<PiPlus />}
          onClick={(e) => {
            e.stopPropagation();
            onAddComment();
          }}
          size="xxs"
          variant="subPrimary"
        >
          코멘트
        </Button>
      </div>

      <p className="text-neutral pl-9 whitespace-pre-wrap">{answer}</p>
    </div>
  );
};
