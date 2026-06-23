import type { PartNameType } from '@/apis/parts/schema';
import type { ExtendedMemberValues } from '@/routes/~_auth/~members/~list/utils/getExtendedMemberValues';
import type { Prettify } from '@/types/misc';

import { type BaseMemberType } from '@/apis/members/schema';

type BaseMemberEditFormType = Prettify<Omit<BaseMemberType, 'parts'> & { part: PartNameType }>;

type ExtendedMemberEditFormType = {
  비액티브: ExtendedMemberValues<'비액티브'>;
  수료: ExtendedMemberValues<'수료'>;
  액티브: ExtendedMemberValues<'액티브'>;
  졸업: ExtendedMemberValues<'졸업'>;
  탈퇴: ExtendedMemberValues<'탈퇴'>;
};

export type EditFormContextType = {
  extended: ExtendedMemberEditFormType;
  member: BaseMemberEditFormType;
};
