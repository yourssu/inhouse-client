import type { Control } from 'react-hook-form';

import { IconButton } from '@yourssu-inhouse/interior';
import { MdDeleteOutline } from 'react-icons/md';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import type { QuestionnaireFormValues } from '../questionnaireForm';

import { EditableQuestionFields } from './EditableQuestionFields';
import { InterviewerField } from './InterviewerField';
import { QuestionCardFrame } from './QuestionCardFrame';

interface PartQuestionCardProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  index: number;
  isInterviewerDisabled: boolean;
  isQuestionEditingDisabled: boolean;
  onDelete: () => Promise<void>;
  requirements: InterviewRequirements;
}

export const PartQuestionCard = ({
  activeMembers,
  control,
  index,
  isInterviewerDisabled,
  isQuestionEditingDisabled,
  onDelete,
  requirements,
}: PartQuestionCardProps) => {
  return (
    <QuestionCardFrame>
      <EditableQuestionFields
        category="PART"
        control={control}
        deleteButton={
          <IconButton
            aria-label="파트 공통 질문 삭제"
            disabled={isQuestionEditingDisabled}
            onClick={onDelete}
            size="xs"
            tooltipContent="질문 삭제"
            type="button"
          >
            <MdDeleteOutline aria-hidden className="size-4" />
          </IconButton>
        }
        disabled={isQuestionEditingDisabled}
        index={index}
        requirements={requirements}
      />

      <InterviewerField
        activeMembers={activeMembers}
        control={control}
        disabled={isInterviewerDisabled}
        name={`PART.${index}.assignedMemberId`}
      />
    </QuestionCardFrame>
  );
};
