import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { completedMembersOption } from '@/apis/members/query';
import { Badge } from '@/components/_ui/Badge';
import { Table } from '@/components/_ui/Table';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/BaseMembersTable';

interface CompletedMembersTableProps {
  searchKeyword: string;
}

export const CompletedMembersTable = ({ searchKeyword }: CompletedMembersTableProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useQuery({
    ...completedMembersOption({
      partId: search.partId,
      search: useDelayedValue(searchKeyword),
    }),
    placeholderData: keepPreviousData,
  });

  if (!members) {
    return <Table.Skeleton count={10} />;
  }

  return (
    <BaseMembersTable
      extendedColumns={
        members.isSensitiveMasked
          ? [<Table.Th key="고문 희망">고문 희망</Table.Th>]
          : [
              <Table.Th key="활동 기간">활동 기간</Table.Th>,
              <Table.Th key="고문 희망">고문 희망</Table.Th>,
            ]
      }
      members={members.members}
    >
      {(member) => (
        <>
          {!members.isSensitiveMasked && (
            <Table.Cell>
              {member.activePeriod?.startSemester ?? ''} ~ {member.activePeriod?.endSemester ?? ''}
            </Table.Cell>
          )}
          <Table.Cell>
            <Badge color={member.isAdvisorDesired ? 'green' : 'grey'} size="md">
              {member.isAdvisorDesired ? '희망' : '미희망'}
            </Badge>
          </Table.Cell>
        </>
      )}
    </BaseMembersTable>
  );
};
