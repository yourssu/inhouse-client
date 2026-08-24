import { Badge, Checkbox, Fieldset } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { ActiveMemberType } from '@/apis/members/schema';

import type { CultureQuestionFormValue, QuestionnaireFormValues } from '../questionnaireForm';

import { InterviewerField } from './InterviewerField';
import { QuestionCardFrame } from './QuestionCardFrame';

interface CultureQuestionCardProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  index: number;
  isInterviewerDisabled: boolean;
  isSelectionDisabled: boolean;
  question: CultureQuestionFormValue;
}

export const CultureQuestionCard = ({
  activeMembers,
  control,
  index,
  isInterviewerDisabled,
  isSelectionDisabled,
  question,
}: CultureQuestionCardProps) => {
  return (
    <Controller
      control={control}
      name={`CULTURE.${index}.isSelected`}
      render={({ field }) => (
        <QuestionCardFrame
          onClick={isSelectionDisabled ? undefined : () => field.onChange(field.value !== true)}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-neutral whitespace-pre-wrap">{question.content}</p>
            </div>

            <div onClick={(event) => event.stopPropagation()}>
              <Checkbox
                checked={field.value === true}
                disabled={isSelectionDisabled}
                label="선택"
                onCheckedChange={field.onChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Fieldset label="요구조건">
              <div className="flex min-h-7 flex-wrap items-center gap-1.5">
                {question.requirements.map(({ content, id }) => (
                  <Badge color="yellow" key={id} size="md">
                    {content}
                  </Badge>
                ))}
              </div>
            </Fieldset>
          </div>

          <InterviewerField
            activeMembers={activeMembers}
            control={control}
            disabled={isInterviewerDisabled}
            isRequired={field.value === true}
            name={`CULTURE.${index}.assignedMemberId`}
          />
        </QuestionCardFrame>
      )}
    />
  );
};
