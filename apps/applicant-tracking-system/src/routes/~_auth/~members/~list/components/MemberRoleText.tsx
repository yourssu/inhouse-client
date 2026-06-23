import type { MemberRoleType } from '@/apis/members/schema';

import { memberRoleKo } from '@/types/members';
import { tv } from '@/utils/tw';

const role = tv({
  base: 'text-13 mr-3 min-w-10 text-center font-semibold',
  variants: {
    role: {
      ViceLead: 'text-orange600',
      Member: 'text-blue600',
      Lead: 'text-red600',
    },
  },
});

export const MemberRoleText = ({ role: roleValue }: { role: MemberRoleType }) => {
  return <div className={role({ role: roleValue })}>{memberRoleKo[roleValue]}</div>;
};
