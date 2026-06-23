import { useSuspenseQuery } from '@tanstack/react-query';
import { type Dispatch, type SetStateAction, startTransition } from 'react';
import { SwitchCase } from 'react-simplikit';

import type { EditFormContextType } from '@/routes/~_auth/~members/~list/type';

import { memberState } from '@/apis/members/schema';
import { semestersOption } from '@/apis/semesters/query';
import { Fieldset } from '@/components/_ui/Fieldset';
import { Select } from '@/components/_ui/Select';
import { Switch } from '@/components/_ui/Switch';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { type ExtendedMemberValues } from '@/routes/~_auth/~members/~list/utils/getExtendedMemberValues';

interface MemberActivityFormProps {
  context: EditFormContextType;
  setContext: Dispatch<SetStateAction<EditFormContextType>>;
}

interface ActiveFormProps {
  setValue: Dispatch<SetStateAction<ExtendedMemberValues<'액티브'>>>;
  value: ExtendedMemberValues<'액티브'>;
}

interface InactiveFormProps {
  setValue: Dispatch<SetStateAction<ExtendedMemberValues<'비액티브'>>>;
  value: ExtendedMemberValues<'비액티브'>;
}

interface GraduatedFormProps {
  setValue: Dispatch<SetStateAction<ExtendedMemberValues<'졸업'>>>;
  value: ExtendedMemberValues<'졸업'>;
}

const parsePeriodSemester = (v: null | string) => {
  return v ? (v.endsWith('학기') ? v : `${v}학기`) : undefined;
};

const ActiveForm = ({ value, setValue }: ActiveFormProps) => {
  const setters = {
    membershipFee: useSetStateSelector(setValue, 'membershipFee'),
    grade: useSetStateSelector(setValue, 'grade'),
    isOnLeave: useSetStateSelector(setValue, 'isOnLeave'),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-15 py-1.5 font-medium">활동 상태</span>
        <Select
          items={['1학년', '2학년', '3학년', '4학년', '5학년', '6학년']}
          onValueChange={(v) => {
            const numberGrade = Number(v.replace('학년', ''));
            setters.grade(numberGrade);
          }}
          placeholder="학년"
          size="md"
          value={value.grade ? `${value.grade}학년` : undefined}
          variant="inline"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-15 py-1.5 font-medium">휴학 여부</span>
        <Switch
          checked={value.isOnLeave ?? false}
          onCheckedChange={(v) => setters.isOnLeave(v)}
          size="md"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-15 py-1.5 font-medium">회비 납부 여부</span>
        <Switch
          checked={value.membershipFee ?? false}
          onCheckedChange={(v) => setters.membershipFee(v)}
          size="md"
        />
      </div>
    </div>
  );
};

const InactiveForm = ({ value, setValue }: InactiveFormProps) => {
  const { data: semesters } = useSuspenseQuery(semestersOption());

  const setters = {
    startSemester: useSetStateSelector(setValue, 'activePeriod.startSemester'),
    endSemester: useSetStateSelector(setValue, 'activePeriod.endSemester'),
    expectedReturnSemester: useSetStateSelector(setValue, 'expectedReturnSemester'),
  };

  return (
    <div className="flex flex-col gap-3">
      <Fieldset label="활동 기간">
        <div className="flex items-center gap-4">
          <Select
            className="w-full"
            disabled
            items={semesters.map((v) => v.semester)}
            onValueChange={setters.startSemester}
            placeholder="활동 시작 학기"
            size="lg"
            value={parsePeriodSemester(value.activePeriod.startSemester)}
            variant="dimmed"
          />
          <div>~</div>
          <Select
            className="w-full"
            disabled
            items={semesters.map((v) => v.semester)}
            onValueChange={setters.endSemester}
            placeholder="활동 종료 학기"
            size="lg"
            value={parsePeriodSemester(value.activePeriod.endSemester)}
            variant="dimmed"
          />
        </div>
      </Fieldset>
      <Select
        className="w-full"
        items={semesters.map((v) => v.semester)}
        label="복귀 예정 학기"
        onValueChange={setters.expectedReturnSemester}
        placeholder="복귀 예정 학기"
        size="lg"
        value={parsePeriodSemester(value.expectedReturnSemester)}
        variant="outline"
      />
    </div>
  );
};

const GraduatedForm = ({ value, setValue }: GraduatedFormProps) => {
  const { data: semesters } = useSuspenseQuery(semestersOption());

  const setters = {
    startSemester: (v: string) =>
      setValue((prev) => ({
        ...prev,
        activePeriod: { startSemester: v, endSemester: prev.activePeriod?.endSemester ?? '' },
      })),
    endSemester: (v: string) =>
      setValue((prev) => ({
        ...prev,
        activePeriod: { startSemester: prev.activePeriod?.startSemester ?? '', endSemester: v },
      })),
    isAdvisorDesired: useSetStateSelector(setValue, 'isAdvisorDesired'),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Fieldset label="활동 기간">
          <div className="flex items-center gap-4">
            <Select
              className="w-full"
              disabled
              items={semesters.map((v) => v.semester)}
              onValueChange={setters.startSemester}
              placeholder="활동 시작 학기"
              size="lg"
              value={parsePeriodSemester(value.activePeriod?.startSemester ?? null)}
              variant="dimmed"
            />
            <div>~</div>
            <Select
              className="w-full"
              disabled
              items={semesters.map((v) => v.semester)}
              onValueChange={setters.endSemester}
              placeholder="활동 종료 학기"
              size="lg"
              value={parsePeriodSemester(value.activePeriod?.endSemester ?? null)}
              variant="dimmed"
            />
          </div>
        </Fieldset>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-15 py-1.5 font-medium">어드바이저 희망 여부</span>
        <Switch
          checked={value.isAdvisorDesired ?? false}
          onCheckedChange={(v) => setters.isAdvisorDesired(v)}
          size="md"
        />
      </div>
    </div>
  );
};

export const MemberActivityForm = ({ context, setContext }: MemberActivityFormProps) => {
  const setters = {
    state: useSetStateSelector(setContext, 'member.state'),
    액티브: useSetStateSelector(setContext, 'extended.액티브'),
    비액티브: useSetStateSelector(setContext, 'extended.비액티브'),
    졸업: useSetStateSelector(setContext, 'extended.졸업'),
    탈퇴: useSetStateSelector(setContext, 'extended.탈퇴'),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-15 py-1.5 font-medium">활동 상태</span>
        <Select
          className="font-medium"
          contentProps={{
            align: 'end',
          }}
          items={memberState}
          onValueChange={(v) => startTransition(() => setters.state(v))}
          placeholder="활동 상태"
          size="md"
          value={context.member.state}
          variant="inline"
        />
      </div>
      <SwitchCase
        caseBy={{
          액티브: () => <ActiveForm setValue={setters.액티브} value={context.extended.액티브} />,
          비액티브: () => (
            <InactiveForm setValue={setters.비액티브} value={context.extended.비액티브} />
          ),
          졸업: () => <GraduatedForm setValue={setters.졸업} value={context.extended.졸업} />,
          탈퇴: () => null,
        }}
        value={context.member.state}
      />
      <div className="text-red500 mt-3 text-sm">
        ⓘ 활동 상태를 수정하면 이전 활동 정보들은 사라져요.
      </div>
    </div>
  );
};
