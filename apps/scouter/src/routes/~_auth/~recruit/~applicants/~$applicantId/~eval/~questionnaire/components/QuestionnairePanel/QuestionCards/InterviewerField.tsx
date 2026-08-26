import { Fieldset, Select } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { QuestionCategory } from '@/apis/interviews/questions/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import { FieldErrorMessage } from '@/components/FieldErrorMessage';

import type { QuestionnaireFormValues } from '../questionnaireForm';

import { useQuestionnaireAnalytics } from '../../../analytics';

type InterviewerFieldName = `${QuestionCategory}.${number}.assignedMemberId`;

interface InterviewerFieldProps {
  activeMembers: ActiveMemberType[];
  category: QuestionCategory;
  control: Control<QuestionnaireFormValues>;
  disabled: boolean;
  isRequired?: boolean;
  name: InterviewerFieldName;
}

export const InterviewerField = ({
  activeMembers,
  category,
  control,
  disabled,
  isRequired = true,
  name,
}: InterviewerFieldProps) => {
  const trackQuestionnaireEvent = useQuestionnaireAnalytics();

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <InterviewerSelect
            activeMembers={activeMembers}
            disabled={disabled}
            errorMessage={fieldState.error?.message}
            onChange={(memberId) => {
              if (field.value === memberId) {
                return;
              }

              field.onChange(memberId);
              trackQuestionnaireEvent('questionnaire_questioner_changed', {
                assigned_member_id: memberId,
                question_category: category,
              });
            }}
            ref={field.ref}
            value={field.value}
          />
        )}
        rules={{ required: isRequired && '질문자를 선택해 주세요.' }}
      />
    </div>
  );
};

interface InterviewerSelectProps {
  activeMembers: ActiveMemberType[];
  disabled: boolean;
  errorMessage?: string;
  onChange: (memberId: number) => void;
  ref?: React.Ref<HTMLButtonElement>;
  value?: number;
}

const InterviewerSelect = ({
  activeMembers,
  disabled,
  errorMessage,
  onChange,
  ref,
  value,
}: InterviewerSelectProps) => {
  const memberIdByNickname = new Map(
    activeMembers.map(({ memberId, nickname }) => [nickname, memberId]),
  );
  const interviewerNicknameByMemberId = new Map(
    activeMembers.map(({ memberId, nickname }) => [memberId, nickname]),
  );
  const nicknames = activeMembers.map(({ nickname }) => nickname);

  return (
    <Fieldset
      help={errorMessage && <FieldErrorMessage>{errorMessage}</FieldErrorMessage>}
      label="질문자"
    >
      <Select
        className="w-full"
        disabled={disabled}
        invalid={!!errorMessage}
        items={nicknames}
        onValueChange={(nickname) => {
          const memberId = memberIdByNickname.get(nickname);
          if (memberId !== undefined) {
            onChange(memberId);
          }
        }}
        placeholder="질문자를 선택하세요"
        ref={ref}
        size="md"
        value={value === undefined ? undefined : interviewerNicknameByMemberId.get(value)}
        variant="outline"
      />
    </Fieldset>
  );
};
