import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Table } from '@yourssu-inhouse/interior';

import { inactiveMembersOption } from '@/apis/members/query';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/BaseMembersTable';

interface InactiveMembersTableProps {
  searchKeyword: string;
}

export const InactiveMembersTable = ({ searchKeyword }: InactiveMembersTableProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useQuery({
    ...inactiveMembersOption({
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
          ? []
          : [
              <Table.Th key="활동 기간">활동 기간</Table.Th>,
              <Table.Th key="복귀 희망 학기">복귀 희망 학기</Table.Th>,
            ]
      }
      members={members.members}
    >
      {(member) => (
        <>
          {!members.isSensitiveMasked && (
            <>
              <Table.Cell>
                {member.activePeriod?.startSemester ?? ''} ~{' '}
                {member.activePeriod?.endSemester ?? ''}
              </Table.Cell>
              <Table.Cell>{member.expectedReturnSemester}</Table.Cell>
            </>
          )}
        </>
      )}
    </BaseMembersTable>
  );
};
