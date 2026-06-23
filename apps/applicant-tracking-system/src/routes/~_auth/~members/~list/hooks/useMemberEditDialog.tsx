import { useSuspenseQuery } from '@tanstack/react-query';
import { assert, isNil, omitBy } from 'es-toolkit';
import { useMemo } from 'react';
import { MdRefresh } from 'react-icons/md';

import type { BaseMemberType, MemberStateType } from '@/apis/members/schema';
import type { EditFormContextType } from '@/routes/~_auth/~members/~list/type';
import type { MapNonNullable } from '@/types/misc';

import { patchMember } from '@/apis/members';
import { partsOption } from '@/apis/parts/query';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useTabDialog } from '@/hooks/useTabDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { MemberActivityForm } from '@/routes/~_auth/~members/~list/components/MemberEditForm/MemberActivityForm';
import { MemberMemoForm } from '@/routes/~_auth/~members/~list/components/MemberEditForm/MemberMemoForm';
import { PersonalInformationForm } from '@/routes/~_auth/~members/~list/components/MemberEditForm/PersonalInformationForm';
import { YourssuInformationForm } from '@/routes/~_auth/~members/~list/components/MemberEditForm/YourssuInformationForm';
import {
  type ExtendedMemberValues,
  getExtendedMemberValues,
} from '@/routes/~_auth/~members/~list/utils/getExtendedMemberValues';
import { memberStateEn } from '@/types/members';
import { getDiffOf } from '@/utils/object';

export const useMemberEditDialog = (member: BaseMemberType) => {
  const openTabDialog = useTabDialog();
  const { data: parts } = useSuspenseQuery(partsOption());
  const { mutateWithToast } = useToastedMutation({
    mutationFn: patchMember,
    successText: '정보를 수정했어요.',
  });
  const { invalidate } = useQueryInvalidation(['members', memberStateEn[member.state]]);

  const initialContext: EditFormContextType = useMemo(() => {
    const { parts, phoneNumber, studentId, birthDate, note, ...m } = member;
    return {
      member: {
        ...m,
        phoneNumber,
        studentId,
        birthDate,
        note,
        part: parts[0].part,
      },
      extended: {
        액티브: getExtendedMemberValues(member, '액티브'),
        비액티브: getExtendedMemberValues(member, '비액티브'),
        졸업: getExtendedMemberValues(member, '졸업'),
        수료: getExtendedMemberValues(member, '수료'),
        탈퇴: getExtendedMemberValues(member, '탈퇴'),
      },
    };
  }, [member]);

  const onSubmit = async (context: EditFormContextType) => {
    const getPartIdByName = (partName: string) => {
      const part = parts.find((p) => p.partName === partName);
      assert(!!part, `올바르지 않은 파트 정보예요: ${partName}`);
      return part.partId;
    };

    const getChangedPartIds = () => {
      const initialPartIds = member.parts.map(({ part }) => getPartIdByName(part));
      const partId = getPartIdByName(context.member.part);
      return {
        partIds: initialPartIds.includes(partId) ? undefined : [partId],
      };
    };

    const getChangedMemberFields = () => {
      const preprocessMemo = (memo: string) => {
        return memo.trim().replace(/\n{2,}/g, '\n\n');
      };
      const { note, ...rest } = context.member;
      return getDiffOf({ ...rest, note: preprocessMemo(note ?? '') }, initialContext.member);
    };

    const getChangedExtendedFields = () => {
      const initialExtended = initialContext.extended[context.member.state];
      const currentExtended = context.extended[context.member.state] as MapNonNullable<
        ExtendedMemberValues<MemberStateType>
      >;
      return getDiffOf(currentExtended, initialExtended);
    };

    return await mutateWithToast({
      prevState: memberStateEn[member.state],
      memberId: member.memberId,
      data: omitBy(
        {
          ...getChangedPartIds(),
          ...getChangedMemberFields(),
          ...getChangedExtendedFields(),
        },
        isNil,
      ),
    });
  };

  const onClickEdit = () =>
    openTabDialog({
      tabs: ['유어슈 정보', '개인 정보', '활동', '메모'],
      context: initialContext,
      caseBy: ({ context, setContext }) => ({
        '유어슈 정보': <YourssuInformationForm context={context} setContext={setContext} />,
        '개인 정보': <PersonalInformationForm context={context} setContext={setContext} />,
        활동: <MemberActivityForm context={context} setContext={setContext} />,
        메모: <MemberMemoForm context={context} setContext={setContext} />,
      }),
      renderButtonGroup: ({ Button, context, setContext, closeAsTrue }) => (
        <>
          <Button
            left={<MdRefresh />}
            onClick={() => setContext(initialContext)}
            variant="transparent"
          >
            초기화
          </Button>
          <Button
            onClick={async () => {
              const { success } = await onSubmit(context);
              if (success) {
                await invalidate();
                closeAsTrue();
              }
            }}
          >
            수정
          </Button>
        </>
      ),
    });

  return onClickEdit;
};
