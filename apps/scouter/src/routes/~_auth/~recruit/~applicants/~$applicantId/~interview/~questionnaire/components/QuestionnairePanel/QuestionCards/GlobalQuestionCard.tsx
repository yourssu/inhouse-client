import type { Control } from 'react-hook-form';

import type { ActiveMemberType } from '@/apis/members/schema';

import type { GlobalQuestionFormValue, QuestionnaireFormValues } from '../questionnaireForm';

import { InterviewerField } from './InterviewerField';
import { QuestionCardFrame } from './QuestionCardFrame';

interface GlobalQuestionCardProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  index: number;
  question: GlobalQuestionFormValue;
}

export const GlobalQuestionCard = ({
  activeMembers,
  control,
  index,
  question,
}: GlobalQuestionCardProps) => {
  return (
    <QuestionCardFrame>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-neutral whitespace-pre-wrap">{question.content}</p>
        </div>
      </div>

      <InterviewerField
        activeMembers={activeMembers}
        control={control}
        name={`GLOBAL.${index}.assignedInterviewerUserId`}
      />
    </QuestionCardFrame>
  );
};
