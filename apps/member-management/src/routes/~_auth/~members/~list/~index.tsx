import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { useDelayedValue } from '@yourssu-inhouse/inhouse-react/hooks';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { objectValues } from '@yourssu-inhouse/inhouse-utils/object';
import { Badge } from '@yourssu-inhouse/interior';
import { ChipTabPrimitive } from '@yourssu-inhouse/interior';
import { InlineButton } from '@yourssu-inhouse/interior';
import { Pagination } from '@yourssu-inhouse/interior';
import { Result } from '@yourssu-inhouse/interior';
import { SearchField } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { tv } from '@yourssu-inhouse/interior-tailwind/utils';
import { invert } from 'es-toolkit';
import { Suspense, useState } from 'react';
import { match } from 'ts-pattern';
import { z } from 'zod/v4';

import { membersQueries } from '@/apis/members/query';
import { type MemberState, memberStateSchema, partNameSchema } from '@/apis/members/schema';
import { useSearchState } from '@/hooks/useSearchState';
import { MemberHistoryTooltip } from '@/routes/~_auth/~members/~list/components/MemberHistoryTooltip';
import { memberPositionKo, memberStateKo, partNameKo } from '@/types/member';

const memberPosition = tv({
  base: 'text-13 mr-3 min-w-10 text-center font-semibold',
  variants: {
    position: {
      VICELEAD: 'text-orange600',
      MEMBER: 'text-blue600',
      LEAD: 'text-red600',
    },
  },
});

const MemberTable = ({ keyword }: { keyword: string }) => {
  const [search, setSearch] = useSearchState({ from: '/_auth/members/list/' });
  const setters = {
    page: useSetStateSelector(setSearch, 'page'),
    part: useSetStateSelector(setSearch, 'part'),
  };

  const { data: members } = useSuspenseQuery(
    membersQueries.list({
      page: search.page,
      pageSize: 10,
      query: useDelayedValue(keyword),
      part: search.part,
      status: search.status,
    }),
  );

  const formatSemester = (semester: string) => {
    const [year, term] = semester.split('-');
    return `${year}년 ${term}학기`;
  };

  return (
    <>
      <Table rowCount={members.items.length} stickyHorizontal>
        <Table.Head>
          <Table.Th className="min-w-54">멤버 목록 · {members.totalCount}명</Table.Th>
          <Table.ThSelect
            items={objectValues(partNameKo)}
            onValueChange={(v) => {
              setters.part(invert(partNameKo)[v]);
              setters.page(undefined);
            }}
            placeholder="파트"
            value={search.part && partNameKo[search.part]}
          />
          <Table.Th>학번</Table.Th>
          <Table.Th>전공</Table.Th>
          <Table.Th>가입 학기</Table.Th>
          <Table.Th>학년</Table.Th>
          <Table.Th>활동 내역</Table.Th>
          <Table.Th>휴학 여부</Table.Th>
          <Table.Th>회비 납부</Table.Th>
        </Table.Head>
        <Table.Body>
          {members.items.map((member) => (
            <Table.Row hoverable key={member.memberId}>
              <Table.Cell className="min-w-54">
                <span className={memberPosition({ position: member.position })}>
                  {memberPositionKo[member.position]}
                </span>
                <span className="text-neutral font-semibold">{member.nickname}</span>
                <span className="text-neutralSubtle ml-1 font-medium">({member.nicknameKo})</span>
              </Table.Cell>
              <Table.Cell>{member.partNames.map((part) => partNameKo[part]).join(', ')}</Table.Cell>
              <Table.Cell>{member.studentId}</Table.Cell>
              <Table.Cell>{member.department}</Table.Cell>
              <Table.Cell>{formatSemester(member.joinSemester)}</Table.Cell>
              <Table.Cell>{member.grade ? `${member.grade}학년` : '-'}</Table.Cell>
              <Table.Cell>
                <MemberHistoryTooltip history={member.history} nickname={member.nickname} />
              </Table.Cell>
              <Table.Cell>
                {match(member.isOnLeave)
                  .with(true, () => (
                    <Badge color="yellow" size="md">
                      휴학
                    </Badge>
                  ))
                  .with(false, () => (
                    <Badge color="blue" size="md">
                      재학
                    </Badge>
                  ))
                  .otherwise(() => '-')}
              </Table.Cell>
              <Table.Cell>
                {match(member.isDuesPaid)
                  .with(true, () => (
                    <Badge color="green" size="md">
                      납부
                    </Badge>
                  ))
                  .with(false, () => (
                    <Badge color="red" size="md">
                      미납
                    </Badge>
                  ))
                  .otherwise(() => '-')}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {members.items.length === 0 && (
        <Result
          description="상태를 변경하거나 필터를 제거해보세요."
          figure={<Lottie className="size-10" delay={0.2} src="/lotties/empty.json" />}
          title="검색된 멤버가 없어요"
        />
      )}
      <div className="mt-4.5 flex w-full justify-end pb-3">
        <Pagination
          currentPage={members.page}
          onPageChange={(page) => setters.page(page)}
          totalPages={members.totalPages}
        />
      </div>
    </>
  );
};

const RouteComponent = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/members/list/' });
  const setters = {
    search: useSetStateSelector(setSearch, 'search'),
    page: useSetStateSelector(setSearch, 'page'),
    part: useSetStateSelector(setSearch, 'part'),
    status: useSetStateSelector(setSearch, 'status'),
  };

  const [keyword, setKeyword] = useState(search.search ?? '');

  return (
    <PageLayout.Content title="멤버 관리">
      <ChipTabPrimitive
        onTabChange={(v) => {
          setters.status(v as MemberState);
          setters.page(undefined);
        }}
        tab={search.status}
      >
        {memberStates.map((state) => (
          <ChipTabPrimitive.Item key={state} value={state}>
            {memberStateKo[state]}
          </ChipTabPrimitive.Item>
        ))}
      </ChipTabPrimitive>
      <div className="flex flex-[1_1_0] gap-4 pt-3.5">
        <div className="bg-lightBackground h-fit min-w-130 grow rounded-xl px-4 py-1">
          <div className="mb-0.5 pt-3">
            <div className="flex items-center gap-4 px-1">
              <SearchField
                className="w-60"
                onChange={(v) => {
                  setters.search(v || undefined);
                  setters.page(undefined);
                  setKeyword(v);
                }}
                onDeleteClick={() => {
                  setters.search(undefined);
                  setters.page(undefined);
                  setKeyword('');
                }}
                placeholder="이름, 닉네임으로 검색"
                size="md"
                value={keyword}
                variant="outline"
              />
              {search.part && (
                <InlineButton
                  className="text-violet600 text-sm font-medium underline"
                  onClick={() => setters.part(undefined)}
                >
                  필터 제거하기
                </InlineButton>
              )}
            </div>
          </div>
          <Suspense fallback={<Table.Skeleton count={10} />}>
            <MemberTable keyword={keyword} />
          </Suspense>
        </div>
      </div>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/members/list/')({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().optional(),
    search: z.string().optional(),
    part: partNameSchema.optional(),
    status: memberStateSchema.optional().default('active'), // 멤버 상태 (active, inactive, completed, withdrawn)
  }),
});

const memberStates = ['active', 'inactive', 'completed', 'withdrawn'] as const;
