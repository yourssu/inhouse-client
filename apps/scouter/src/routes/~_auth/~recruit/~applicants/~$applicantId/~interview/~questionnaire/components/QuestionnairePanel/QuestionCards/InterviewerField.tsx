import { Fieldset, Select } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { QuestionCategory } from '@/apis/interviews/questions/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { isInterviewQuestionnaireActionAllowed } from '@/types/applicants';

import type { QuestionnaireFormValues } from '../questionnaireForm';

type InterviewerFieldName = `${QuestionCategory}.${number}.assignedInterviewerUserId`;

interface InterviewerFieldProps {
  activeMembers: ActiveMemberType[];
  applicant: ApplicantType;
  control: Control<QuestionnaireFormValues>;
  isRequired?: boolean;
  name: InterviewerFieldName;
}

export const InterviewerField = ({
  activeMembers,
  applicant,
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
            applicant={applicant}
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
  applicant: ApplicantType;
  errorMessage?: string;
  onChange: (interviewerId: number) => void;
  ref?: React.Ref<HTMLButtonElement>;
  value?: number;
}

const InterviewerSelect = ({
  activeMembers,
  applicant,
  errorMessage,
  onChange,
  ref,
  value,
}: InterviewerSelectProps) => {
  const { state } = applicant;
  const isActionAllowed = isInterviewQuestionnaireActionAllowed(state);
  // 질문자 배정에는 멤버 ID가 아니라 로그인 계정 ID가 필요해서, 계정이 연동된 멤버만 선택할 수 있어요.
  const assignableMembers = activeMembers.flatMap(({ nickname, userId }) =>
    userId === undefined || userId === null ? [] : [{ nickname, userId }],
  );
  const interviewerIdByNickname = new Map(
    assignableMembers.map(({ nickname, userId }) => [nickname, userId]),
  );
  const interviewerNicknameById = new Map(
    assignableMembers.map(({ nickname, userId }) => [userId, nickname]),
  );
  const nicknames = assignableMembers.map(({ nickname }) => nickname);

  return (
    <Fieldset
      help={errorMessage && <FieldErrorMessage>{errorMessage}</FieldErrorMessage>}
      label="질문자"
    >
      <Select
        className="w-full"
        disabled={!isActionAllowed}
        invalid={!!errorMessage}
        items={nicknames}
        onValueChange={(nickname) => {
          const interviewerId = interviewerIdByNickname.get(nickname);
          if (interviewerId !== undefined) {
            onChange(interviewerId);
          }
        }}
        placeholder="질문자를 선택하세요"
        ref={ref}
        size="md"
        value={value === undefined ? undefined : interviewerNicknameById.get(value)}
        variant="outline"
      />
    </Fieldset>
  );
};
