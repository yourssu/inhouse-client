import type { Control } from 'react-hook-form';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { QuestionCategory } from '@/apis/interviews/questions/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import type { QuestionnaireFormValues, SourceQuestionFormValue } from '../questionnaireForm';

import { InterviewerField } from './InterviewerField';
import { QuestionCardFrame } from './QuestionCardFrame';

type RequiredQuestionCategory = Extract<QuestionCategory, 'INTRO' | 'OUTRO'>;

interface RequiredQuestionCardProps {
  activeMembers: ActiveMemberType[];
  applicant: ApplicantType;
  category: RequiredQuestionCategory;
  control: Control<QuestionnaireFormValues>;
  index: number;
  question: SourceQuestionFormValue;
}

export const RequiredQuestionCard = ({
  activeMembers,
  applicant,
  category,
  control,
  index,
  question,
}: RequiredQuestionCardProps) => {
  return (
    <QuestionCardFrame>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-neutral whitespace-pre-wrap">{question.content}</p>
        </div>
      </div>

      <InterviewerField
        activeMembers={activeMembers}
        applicant={applicant}
        control={control}
        name={`${category}.${index}.assignedInterviewerUserId`}
      />
    </QuestionCardFrame>
  );
};
