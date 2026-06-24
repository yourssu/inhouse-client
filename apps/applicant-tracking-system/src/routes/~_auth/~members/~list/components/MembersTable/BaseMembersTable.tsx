import { useSuspenseQuery } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { HoverTooltip } from '@yourssu-inhouse/interior';
import { Pagination } from '@yourssu-inhouse/interior';
import { Result } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { assert, invert } from 'es-toolkit';
import { startTransition } from 'react';
import { FiMessageSquare } from 'react-icons/fi';

import type { BaseMemberType } from '@/apis/members/schema';

import { partsOption } from '@/apis/parts/query';
import { usePaginatedItems } from '@/hooks/usePaginatedItems';
import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { MemberRoleText } from '@/routes/~_auth/~members/~list/components/MemberRoleText';
import { partNameKo, type PartNameKoType } from '@/types/parts';
import { formatTemplates } from '@/utils/date';
import { objectValues } from '@/utils/object';

interface BaseMembersTableProps<T extends BaseMemberType> {
  children: (member: T) => React.ReactNode;
  extendedColumns?: React.ReactNode[];
  members: T[];
}

export const BaseMembersTable = <TMember extends BaseMemberType>({
  members,
  children,
  extendedColumns = [],
}: BaseMembersTableProps<TMember>) => {
  const [search, setSearch] = useSearchState({ from: '/_auth/members/list/' });
  const setters = {
    mid: useSetStateSelector(setSearch, 'mid'),
    page: useSetStateSelector(setSearch, 'page'),
    partId: useSetStateSelector(setSearch, 'partId'),
  };

  const { data: parts } = useSuspenseQuery(partsOption());
  const part = parts.find(({ partId }) => partId === search.partId);

  const {
    items: paginatedMembers,
    page,
    totalPages,
  } = usePaginatedItems(members, {
    currentPage: search.page ?? 1,
    pageSize: 10,
  });

  const onClickRow = (member: TMember) => {
    setters.mid(search.mid === member.memberId ? undefined : member.memberId);
  };

  const onPartFilterChange = (v: PartNameKoType) => {
    const partNameEn = invert(partNameKo)[v];
    const part = parts.find(({ partName }) => partName === partNameEn);
    assert(!!part, '존재하지 않는 파트를 선택했어요.');
    startTransition(() => {
      setters.partId(part.partId);
      setters.page(undefined);
    });
  };

  const parseMemberDisplayName = (member: TMember) => {
    const match = member.nickname.match(/^(.*)\((.*)\)$/);
    if (match) {
      const [, nickname, pronounce] = match;
      return `${nickname}(${pronounce}, ${member.name})`;
    }
    return member.nickname;
  };

  return (
    <>
      <Table className="px-3 pb-4" rowCount={paginatedMembers.length}>
        <Table.Head>
          <Table.Th className="min-w-70">{`멤버 목록 · ${members.length}명`}</Table.Th>
          <Table.ThSelect
            items={objectValues(partNameKo)}
            onValueChange={onPartFilterChange}
            placeholder="파트"
            value={part && partNameKo[part.partName]}
          />
          <Table.Th>학번</Table.Th>
          <Table.Th>전공</Table.Th>
          <Table.Th>가입일</Table.Th>
          {extendedColumns}
        </Table.Head>
        <Table.Body>
          {paginatedMembers.map((member) => (
            <Table.Row
              className={clsx(search.mid === member.memberId && 'outline-blue500 outline-1')}
              hoverable
              key={member.memberId}
              onClick={() => onClickRow?.(member)}
            >
              <Table.Cell className="text-neutral min-w-70 font-medium">
                <MemberRoleText role={member.role} />
                <span className="shrink-0">{parseMemberDisplayName(member)}</span>
                {member.note && (
                  <HoverTooltip content="작성된 메모가 있어요">
                    <FiMessageSquare className="text-neutralDisabled ml-2 shrink-0" />
                  </HoverTooltip>
                )}
              </Table.Cell>
              <Table.Cell>{partNameKo[member.parts[0].part]}</Table.Cell>
              <Table.Cell>{member.studentId ?? '********'}</Table.Cell>
              <Table.Cell>{member.department}</Table.Cell>
              <Table.Cell>{formatTemplates['2026-01-01'](member.joinDate)}</Table.Cell>
              {children(member)}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {paginatedMembers.length === 0 && (
        <Result
          description="상태를 변경하거나 필터를 제거해보세요."
          figure={<Lottie className="size-10" delay={0.2} src="/lotties/empty.json" />}
          title="검색된 멤버가 없어요"
        />
      )}
      <div className="mt-5 flex w-full justify-end">
        <Pagination
          currentPage={page}
          onPageChange={(page) => setters.page(page)}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};
