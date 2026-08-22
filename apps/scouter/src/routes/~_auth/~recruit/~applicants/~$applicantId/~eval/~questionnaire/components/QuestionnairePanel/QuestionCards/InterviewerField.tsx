import { Fieldset, Select } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { QuestionCategory } from '@/apis/interviews/questions/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import { FieldErrorMessage } from '@/components/FieldErrorMessage';

import type { QuestionnaireFormValues } from '../questionnaireForm';

type InterviewerFieldName = `${QuestionCategory}.${number}.assignedMemberId`;

interface InterviewerFieldProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  isRequired?: boolean;
  name: InterviewerFieldName;
}

export const InterviewerField = ({
  activeMembers,
  control,
  isRequired = true,
  name,
}: InterviewerFieldProps) => {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <InterviewerSelect
            activeMembers={activeMembers}
            errorMessage={fieldState.error?.message}
            onChange={field.onChange}
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
  errorMessage?: string;
  onChange: (memberId: number) => void;
  ref?: React.Ref<HTMLButtonElement>;
  value?: number;
}

const InterviewerSelect = ({
  activeMembers,
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
