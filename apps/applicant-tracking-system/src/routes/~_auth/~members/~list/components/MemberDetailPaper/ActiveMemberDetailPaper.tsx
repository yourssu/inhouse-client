import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@yourssu-inhouse/interior';
import { ItemList } from '@yourssu-inhouse/interior';

import { activeMembersOption } from '@/apis/members/query';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/BaseMemberDetailPaper';

interface ActiveMemberDetailPaperProps {
  onClose: () => void;
}

export const ActiveMemberDetailPaper = ({ onClose }: ActiveMemberDetailPaperProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useSuspenseQuery(activeMembersOption());
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
            <ItemList.Item label="활동 상태">액티브</ItemList.Item>
            {!members.isSensitiveMasked && (
              <ItemList.Item label="회비 납부">
                <Badge color={member.membershipFee ? 'green' : 'red'} size="md">
                  {member.membershipFee ? '납부' : '미납'}
                </Badge>
              </ItemList.Item>
            )}
          </>
        ),
        personalItems: (
          <>
            <ItemList.Item label="학년">
              {member.grade ? (
                `${member.grade}학년`
              ) : (
                <Badge color="red" size="md">
                  작성 필요
                </Badge>
              )}
            </ItemList.Item>
            <ItemList.Item label="휴학 여부">
              {member.isOnLeave === null ? (
                <Badge color="red" size="md">
                  작성 필요
                </Badge>
              ) : (
                <Badge color={member.isOnLeave ? 'grey' : 'green'} size="md">
                  {member.isOnLeave ? '휴학' : '재학'}
                </Badge>
              )}
            </ItemList.Item>
          </>
        ),
      }}
    />
  );
};
