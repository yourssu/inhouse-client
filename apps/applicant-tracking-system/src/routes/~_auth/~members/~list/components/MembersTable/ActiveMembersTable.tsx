import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Badge } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';

import { activeMembersOption } from '@/apis/members/query';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/BaseMembersTable';

interface ActiveMembersTableProps {
  searchKeyword: string;
}

export const ActiveMembersTable = ({ searchKeyword }: ActiveMembersTableProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useQuery({
    ...activeMembersOption({
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
      extendedColumns={[
        <Table.Th key="학년">학년</Table.Th>,
        <Table.Th key="휴학 여부">휴학 여부</Table.Th>,
        ...(members.isSensitiveMasked ? [] : [<Table.Th key="회비 납부">회비 납부</Table.Th>]),
      ]}
      members={members.members}
    >
      {(member) => (
        <>
          <Table.Cell>
            {member.grade ? (
              `${member.grade}학년`
            ) : (
              <Badge color="red" size="md">
                작성 필요
              </Badge>
            )}
          </Table.Cell>
          <Table.Cell>
            {member.isOnLeave === null ? (
              <Badge color="red" size="md">
                작성 필요
              </Badge>
            ) : (
              <Badge color={member.isOnLeave ? 'grey' : 'green'} size="md">
                {member.isOnLeave ? '휴학' : '재학'}
              </Badge>
            )}
          </Table.Cell>
          {!members.isSensitiveMasked && (
            <Table.Cell>
              <Badge color={member.membershipFee ? 'green' : 'red'} size="md">
                {member.membershipFee ? '납부' : '미납'}
              </Badge>
            </Table.Cell>
          )}
        </>
      )}
    </BaseMembersTable>
  );
};
