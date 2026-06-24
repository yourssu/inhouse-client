import type { Dispatch, SetStateAction } from 'react';

import { DatePicker } from '@yourssu-inhouse/interior';
import { Fieldset } from '@yourssu-inhouse/interior';
import { TextField } from '@yourssu-inhouse/interior';

import type { EditFormContextType } from '@/routes/~_auth/~members/~list/type';

import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { formatTemplates } from '@/utils/date';

interface PersonalInformationFormProps {
  context: EditFormContextType;
  setContext: Dispatch<SetStateAction<EditFormContextType>>;
}

export const PersonalInformationForm = ({ context, setContext }: PersonalInformationFormProps) => {
  const setters = {
    name: useSetStateSelector(setContext, 'member.name'),
    studentId: useSetStateSelector(setContext, 'member.studentId'),
    department: useSetStateSelector(setContext, 'member.department'),
    phoneNumber: useSetStateSelector(setContext, 'member.phoneNumber'),
    birthDate: useSetStateSelector(setContext, 'member.birthDate'),
  };

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="이름"
        onChange={(e) => setters.name(e.target.value)}
        placeholder="이름"
        size="lg"
        value={context.member.name}
        variant="outline"
      />
      <TextField
        label="학번"
        onChange={(e) => setters.studentId(e.target.value)}
        placeholder="학번"
        size="lg"
        value={context.member.studentId ?? '********'}
        variant="outline"
      />
      <TextField
        label="학과"
        onChange={(e) => setters.department(e.target.value)}
        placeholder="학과"
        size="lg"
        value={context.member.department}
        variant="outline"
      />
      <TextField
        label="전화번호"
        onChange={(e) => setters.phoneNumber(e.target.value)}
        placeholder="전화번호"
        size="lg"
        value={context.member.phoneNumber ?? '010-****-****'}
        variant="outline"
      />
      <Fieldset label="생년월일">
        {context.member.birthDate === null ? (
          <TextField disabled size="lg" value="********" variant="outline" />
        ) : (
          <DatePicker
            className="w-full"
            onChange={(v) => setters.birthDate(formatTemplates['2026-01-01'](v))}
            size="lg"
            value={new Date(context.member.birthDate)}
            variant="outline"
          />
        )}
      </Fieldset>
    </div>
  );
};
