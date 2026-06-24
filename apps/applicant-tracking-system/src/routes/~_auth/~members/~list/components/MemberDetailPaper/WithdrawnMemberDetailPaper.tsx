import { useSuspenseQuery } from '@tanstack/react-query';
import { ItemList } from '@yourssu-inhouse/interior';

import { withdrawnMembersOption } from '@/apis/members/query';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/BaseMemberDetailPaper';

interface WithdrawnMemberDetailPaperProps {
  onClose: () => void;
}

export const WithdrawnMemberDetailPaper = ({ onClose }: WithdrawnMemberDetailPaperProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useSuspenseQuery(withdrawnMembersOption());
  const member = members.members.find((member) => member.memberId === search.mid);

  if (!member || search.mid === undefined) {
    return null;
  }

  return (
    <BaseMemberDetailPaper
      isSensitiveMasked={members.isSensitiveMasked}
      member={member}
      onClose={onClose}
      slots={{
        yourssuItems: <ItemList.Item label="활동 상태">탈퇴</ItemList.Item>,
      }}
    />
  );
};
