import { Fieldset, Select } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { QuestionCategory } from '@/apis/interviews/questions/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { QuestionnaireFormValues } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionnaireForm';

type InterviewerFieldName = `${QuestionCategory}.${number}.assignedInterviewerUserId`;

interface InterviewerFieldProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  name: InterviewerFieldName;
}

export const InterviewerField = ({ activeMembers, control, name }: InterviewerFieldProps) => {
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
            value={field.value}
          />
        )}
        rules={{ required: '질문자를 선택해 주세요.' }}
      />
    </div>
  );
};

interface InterviewerSelectProps {
  activeMembers: ActiveMemberType[];
  errorMessage?: string;
  onChange: (interviewerId: number) => void;
  value?: number;
}

const InterviewerSelect = ({
  activeMembers,
  errorMessage,
  onChange,
  value,
}: InterviewerSelectProps) => {
  const interviewerIdByNickname = new Map(
    activeMembers.map(({ memberId, nickname }) => [nickname, memberId]),
  );
  const interviewerNicknameById = new Map(
    activeMembers.map(({ memberId, nickname }) => [memberId, nickname]),
  );
  const nicknames = activeMembers.map(({ nickname }) => nickname);

  return (
    <Fieldset help={errorMessage} label="질문자">
      <Select
        className="w-full"
        invalid={!!errorMessage}
        items={nicknames}
        onValueChange={(nickname) => {
          const interviewerId = interviewerIdByNickname.get(nickname);
          if (interviewerId !== undefined) {
            onChange(interviewerId);
          }
        }}
        placeholder="질문자를 선택하세요"
        size="sm"
        value={value === undefined ? undefined : interviewerNicknameById.get(value)}
        variant="outline"
      />
    </Fieldset>
  );
};
