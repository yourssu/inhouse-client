import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { withdrawnMembersOption } from '@/apis/members/query';
import { Table } from '@/components/_ui/Table';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { useSearchState } from '@/hooks/useSearchState';
import { BaseMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/BaseMembersTable';

interface WithdrawnMembersTableProps {
  searchKeyword: string;
}

export const WithdrawnMembersTable = ({ searchKeyword }: WithdrawnMembersTableProps) => {
  const [search] = useSearchState({ from: '/_auth/members/list/' });
  const { data: members } = useQuery({
    ...withdrawnMembersOption({
      partId: search.partId,
      search: useDelayedValue(searchKeyword),
    }),
    placeholderData: keepPreviousData,
  });

  if (!members) {
    return <Table.Skeleton count={10} />;
  }

  return <BaseMembersTable members={members.members}>{() => <></>}</BaseMembersTable>;
};
