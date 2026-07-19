import { useSuspenseQuery } from '@tanstack/react-query';
import { Divider } from '@yourssu-inhouse/interior';
import { Fragment } from 'react';

import type { ApplicantAnswerSectionType } from '@/apis/applicants/schema';

import { applicantDocumentAnswersOption } from '@/apis/applicants/query';

const Answer = ({ sectionId, question, answer }: ApplicantAnswerSectionType) => {
  return (
    <div className="rounded-8 flex h-fit w-full flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="bg-violet50 text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center self-start text-sm font-semibold">
          {sectionId}
        </span>
        <span className="text-neutralMuted text-17 font-semibold">{question}</span>
      </div>
      <p className="text-neutral pl-9 whitespace-pre-wrap">{answer}</p>
    </div>
  );
};

interface AnswerListProps {
  applicantId: number;
}

export const AnswerList = ({ applicantId }: AnswerListProps) => {
  const { data: answers } = useSuspenseQuery(applicantDocumentAnswersOption(applicantId));

  return (
    <div className="flex flex-col">
      {answers.sections.map((section, index) => {
        const isFirst = index === 0;
        return (
          <Fragment key={index}>
            {!isFirst && <Divider />}
            <Answer {...section} />
          </Fragment>
        );
      })}
    </div>
  );
};
