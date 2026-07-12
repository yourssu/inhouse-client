import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { Button } from '@yourssu-inhouse/interior';
import { InlineButton } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { MdAdd } from 'react-icons/md';
import { z } from 'zod/v4';

import { mailReservationStatus } from '@/apis/mails/schema';
import { Paper } from '@/components/Paper';
import { useSearchState } from '@/hooks/useSearchState';
import { MailListTable } from '@/routes/~_auth/~recruit/~mail/components/MailListTable';
import { MailStatusGrid } from '@/routes/~_auth/~recruit/~mail/components/MailStatusGrid';

const RouteComponent = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/mail/' });
  const setters = {
    status: useSetStateSelector(setSearch, 'status'),
    page: useSetStateSelector(setSearch, 'page'),
  };

  const handleCreateMail = () => {
    navigate({ to: '/recruit/mail/new' });
  };

  return (
    <PageLayout.Content
      right={
        <Button
          className="p-2 pr-2.5"
          left={<MdAdd className="size-4.5" />}
          onClick={handleCreateMail}
          size="lg"
        >
          메일 작성
        </Button>
      }
      title="메일 관리"
    >
      <div className="mb-4">
        <Suspense fallback={<MailStatusGrid.Skeleton />}>
          <MailStatusGrid />
        </Suspense>
      </div>
      <div className="flex flex-[1_1_0] gap-4 pt-3.5">
        <Paper className="block h-fit min-w-180 grow px-3 pt-1 pb-3">
          <div className="mb-2 flex items-center justify-between px-2 pt-3">
            <h2 className="text-lg font-semibold">메일 목록</h2>
            {search.status && (
              <InlineButton
                className="text-violet600 text-sm font-medium underline"
                onClick={() => {
                  setters.status(undefined);
                  setters.page(undefined);
                }}
              >
                필터 제거하기
              </InlineButton>
            )}
          </div>
          <Suspense fallback={<Table.Skeleton count={10} />}>
            <MailListTable />
          </Suspense>
        </Paper>
      </div>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/recruit/mail/')({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().optional(),
    status: z.enum(mailReservationStatus).optional().catch(undefined),
  }),
});
