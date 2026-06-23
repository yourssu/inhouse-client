import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import { SwitchCase } from 'react-simplikit';
import { z } from 'zod/v4';

import { ChipTab } from '@/components/_ui/ChipTab';
import { InlineButton } from '@/components/_ui/InlineButton';
import { SearchField } from '@/components/_ui/SearchField';
import { PageLayout } from '@/components/PageLayout';
import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { ActiveMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/ActiveMemberDetailPaper';
import { CompletedMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/CompletedMemberDetailPaper';
import { GraduatedMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/GraduatedMemberDetailPaper';
import { InactiveMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/InactiveMemberDetailPaper';
import { WithdrawnMemberDetailPaper } from '@/routes/~_auth/~members/~list/components/MemberDetailPaper/WithdrawnMemberDetailPaper';
import { ActiveMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/ActiveMembersTable';
import { CompletedMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/CompletedMembersTable';
import { GraduatedMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/GraduatedMembersTable';
import { InactiveMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/InactiveMembersTable';
import { WithdrawnMembersTable } from '@/routes/~_auth/~members/~list/components/MembersTable/WithdrawnMembersTable';
import { MemberSyncButton } from '@/routes/~_auth/~members/~list/components/MemberSyncButton';

const RouteComponent = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/members/list/' });
  const [keyword, setKeyword] = useState<string>(search.search ?? '');
  const setters = {
    mid: useSetStateSelector(setSearch, 'mid'),
    t: useSetStateSelector(setSearch, 't'),
    page: useSetStateSelector(setSearch, 'page'),
    partId: useSetStateSelector(setSearch, 'partId'),
    search: useSetStateSelector(setSearch, 'search'),
  };

  return (
    <PageLayout.Content right={<MemberSyncButton />} title="멤버 관리">
      <ChipTab
        onTabChange={(t) => {
          setters.mid(undefined);
          setters.page(undefined);
          setters.t(t);
        }}
        tab={search.t}
        tabs={['액티브', '비액티브', '졸업', '수료', '탈퇴']}
      >
        {({ tab }) => (
          <div className="flex flex-[1_1_0] gap-4 pt-3.5">
            <div className="bg-lightBackground h-fit min-w-180 grow rounded-xl px-3 pt-1 pb-3">
              <div className="mb-2 pt-3">
                <div className="flex items-center gap-4 px-1">
                  <SearchField
                    className="w-60"
                    onChange={(v) => {
                      setters.search(v);
                      setKeyword(v);
                    }}
                    placeholder="이름, 닉네임으로 검색"
                    size="md"
                    value={keyword}
                    variant="outline"
                  />
                  {search.partId && (
                    <InlineButton
                      className="text-violet600 text-sm font-medium underline"
                      onClick={() => setters.partId(undefined)}
                    >
                      필터 제거하기
                    </InlineButton>
                  )}
                </div>
              </div>
              <Suspense>
                <SwitchCase
                  caseBy={{
                    액티브: () => <ActiveMembersTable searchKeyword={keyword} />,
                    비액티브: () => <InactiveMembersTable searchKeyword={keyword} />,
                    졸업: () => <GraduatedMembersTable searchKeyword={keyword} />,
                    수료: () => <CompletedMembersTable searchKeyword={keyword} />,
                    탈퇴: () => <WithdrawnMembersTable searchKeyword={keyword} />,
                  }}
                  value={tab}
                />
              </Suspense>
            </div>
            {search.mid && (
              <Suspense>
                <SwitchCase
                  caseBy={{
                    액티브: () => (
                      <ActiveMemberDetailPaper onClose={() => setters.mid(undefined)} />
                    ),
                    비액티브: () => (
                      <InactiveMemberDetailPaper onClose={() => setters.mid(undefined)} />
                    ),
                    졸업: () => (
                      <GraduatedMemberDetailPaper onClose={() => setters.mid(undefined)} />
                    ),
                    수료: () => (
                      <CompletedMemberDetailPaper onClose={() => setters.mid(undefined)} />
                    ),
                    탈퇴: () => (
                      <WithdrawnMemberDetailPaper onClose={() => setters.mid(undefined)} />
                    ),
                  }}
                  value={tab}
                />
              </Suspense>
            )}
          </div>
        )}
      </ChipTab>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/members/list/')({
  component: RouteComponent,
  validateSearch: z.object({
    mid: z.number().optional(), // 선택한 멤버 ID
    t: z.enum(['액티브', '비액티브', '졸업', '수료', '탈퇴']).default('액티브').catch('액티브'), // 탭
    page: z.number().optional(),
    search: z.string().optional(),
    partId: z.number().optional(),
  }),
});
