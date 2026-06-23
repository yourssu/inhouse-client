import { match } from 'ts-pattern';

import type {
  ActiveMemberType,
  BaseMemberType,
  CompletedMemberType,
  GraduatedMemberType,
  InactiveMemberType,
  MemberStateType,
  WithdrawnMemberType,
} from '@/apis/members/schema';
import type { Diff, MapNullable } from '@/types/misc';

type MappedMemberType<T extends MemberStateType> = T extends '액티브'
  ? Diff<ActiveMemberType, BaseMemberType>
  : T extends '비액티브'
    ? Diff<InactiveMemberType, BaseMemberType>
    : T extends '졸업'
      ? Diff<GraduatedMemberType, BaseMemberType>
      : T extends '수료'
        ? Diff<CompletedMemberType, BaseMemberType>
        : T extends '탈퇴'
          ? Diff<WithdrawnMemberType, BaseMemberType>
          : never;

export type ExtendedMemberValues<T extends MemberStateType> = MapNullable<MappedMemberType<T>>;

export const getExtendedMemberValues = <T extends MemberStateType = '액티브'>(
  member: BaseMemberType,
  state: T,
): ExtendedMemberValues<T> => {
  const m = member as any;
  return match(state as MemberStateType)
    .with(
      '액티브',
      () =>
        ({
          membershipFee: m.membershipFee ?? null,
          grade: m.grade ?? null,
          isOnLeave: m.isOnLeave ?? null,
        }) satisfies ExtendedMemberValues<'액티브'>,
    )
    .with(
      '비액티브',
      () =>
        ({
          activePeriod: m.activePeriod ?? { startSemester: null, endSemester: null },
          expectedReturnSemester: m.expectedReturnSemester ?? null,
        }) satisfies ExtendedMemberValues<'비액티브'>,
    )
    .with(
      '졸업',
      () =>
        ({
          activePeriod: m.activePeriod ?? { startSemester: null, endSemester: null },
          isAdvisorDesired: m.isAdvisorDesired ?? null,
        }) satisfies ExtendedMemberValues<'졸업'>,
    )
    .with(
      '수료',
      () =>
        ({
          activePeriod: m.activePeriod ?? { startSemester: null, endSemester: null },
          isAdvisorDesired: m.isAdvisorDesired ?? null,
        }) satisfies ExtendedMemberValues<'수료'>,
    )
    .with(
      '탈퇴',
      () => ({ withdrawnDate: m.withdrawnDate ?? null }) satisfies ExtendedMemberValues<'탈퇴'>,
    )
    .exhaustive() as ExtendedMemberValues<T>;
};
