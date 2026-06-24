import { useSuspenseQuery } from '@tanstack/react-query';
import { ItemList } from '@yourssu-inhouse/interior';

import { inactiveMembersOption } from '@/apis/members/query';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/BaseMemberDetailPaper';

interface InactiveMemberDetailPaperProps {
  onClose: () => void;
}

export const InactiveMemberDetailPaper = ({ onClose }: InactiveMemberDetailPaperProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useSuspenseQuery(inactiveMembersOption());
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
            <ItemList.Item label="활동 상태">비액티브</ItemList.Item>
            {!members.isSensitiveMasked && (
              <>
                <ItemList.Item label="활동 기간">
                  {member.activePeriod?.startSemester ?? ''} ~{' '}
                  {member.activePeriod?.endSemester ?? ''}
                </ItemList.Item>
                <ItemList.Item label="복귀 예정">{member.expectedReturnSemester}</ItemList.Item>
              </>
            )}
          </>
        ),
      }}
    />
  );
};
