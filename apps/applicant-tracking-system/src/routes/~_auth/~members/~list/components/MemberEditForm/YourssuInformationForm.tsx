import { invert } from 'es-toolkit';
import { type Dispatch, type SetStateAction } from 'react';

import type { EditFormContextType } from '@/routes/~_auth/~members/~list/type';

import { DatePicker } from '@/components/_ui/DatePicker';
import { Fieldset } from '@/components/_ui/Fieldset';
import { Select } from '@/components/_ui/Select';
import { TextField } from '@/components/_ui/TextField';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { memberRoleKo } from '@/types/members';
import { partNameKo } from '@/types/parts';
import { formatTemplates } from '@/utils/date';

interface YourssuInformationFormProps {
  context: EditFormContextType;
  setContext: Dispatch<SetStateAction<EditFormContextType>>;
}

export const YourssuInformationForm = ({ context, setContext }: YourssuInformationFormProps) => {
  const setters = {
    nickname: useSetStateSelector(setContext, 'member.nickname'),
    email: useSetStateSelector(setContext, 'member.email'),
    part: useSetStateSelector(setContext, 'member.part'),
    role: useSetStateSelector(setContext, 'member.role'),
    joinDate: useSetStateSelector(setContext, 'member.joinDate'),
  };

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="닉네임"
        onChange={(e) => setters.nickname(e.target.value)}
        placeholder="닉네임"
        size="lg"
        value={context.member.nickname}
        variant="outline"
      />
      <TextField
        label="이메일"
        onChange={(e) => setters.email(e.target.value)}
        placeholder="이메일"
        size="lg"
        value={context.member.email}
        variant="outline"
      />
      <div className="flex items-center gap-4">
        <Select
          className="w-full"
          items={Object.values(partNameKo)}
          label="소속 파트"
          onValueChange={(v) => setters.part(invert(partNameKo)[v])}
          placeholder="소속 파트"
          size="lg"
          value={partNameKo[context.member.part]}
          variant="outline"
        />
        <Select
          className="w-full"
          items={Object.values(memberRoleKo)}
          label="역할"
          onValueChange={(v) => setters.role(invert(memberRoleKo)[v])}
          placeholder="역할"
          size="lg"
          value={memberRoleKo[context.member.role]}
          variant="outline"
        />
      </div>
      <Fieldset label="가입일">
        <DatePicker
          className="w-full"
          onChange={(v) => setters.joinDate(formatTemplates['2026-01-01'](v))}
          size="lg"
          value={new Date(context.member.joinDate)}
          variant="outline"
        />
      </Fieldset>
    </div>
  );
};
