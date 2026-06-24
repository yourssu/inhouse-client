import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@yourssu-inhouse/interior';
import { ItemList } from '@yourssu-inhouse/interior';

import { graduatedMembersOption } from '@/apis/members/query';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/BaseMemberDetailPaper';

interface GraduatedMemberDetailPaperProps {
  onClose: () => void;
}

export const GraduatedMemberDetailPaper = ({ onClose }: GraduatedMemberDetailPaperProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useSuspenseQuery(graduatedMembersOption());
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
        yourssuItems: (
          <>
            <ItemList.Item label="활동 상태">졸업</ItemList.Item>
            {!members.isSensitiveMasked && (
              <ItemList.Item label="활동 기간">
                {member.activePeriod?.startSemester ?? ''} ~{' '}
                {member.activePeriod?.endSemester ?? ''}
              </ItemList.Item>
            )}
            <ItemList.Item label="고문 희망">
              <Badge color={member.isAdvisorDesired ? 'green' : 'grey'} size="md">
                {member.isAdvisorDesired ? '희망' : '미희망'}
              </Badge>
            </ItemList.Item>
          </>
        ),
      }}
    />
  );
};
