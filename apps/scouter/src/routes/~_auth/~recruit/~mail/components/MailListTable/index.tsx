import { Lottie } from '@toss/lottie';
import { IconButton } from '@yourssu-inhouse/interior';
import { Menu } from '@yourssu-inhouse/interior';
import { Pagination } from '@yourssu-inhouse/interior';
import { Result } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { invert } from 'es-toolkit';
import { useMemo } from 'react';
import { MdMoreHoriz } from 'react-icons/md';

import type { MailStatusNameType } from '@/types/mails';

import { usePaginatedItems } from '@/hooks/usePaginatedItems';
import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { MailReceiversText } from '@/routes/~_auth/~recruit/~mail/components/MailListTable/MailReceiversText';
import { MailStatusBadge } from '@/routes/~_auth/~recruit/~mail/components/MailListTable/MailStatusBadge';
import { useGroupedMailReservations } from '@/routes/~_auth/~recruit/~mail/hooks/useGroupedMailReservations';
import { mailStatusNameMap, mailStatusNames } from '@/types/mails';
import { formatTemplates } from '@/utils/date';

export const MailListTable = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/mail/' });
  const setters = {
    page: useSetStateSelector(setSearch, 'page'),
    status: useSetStateSelector(setSearch, 'status'),
  };

  const groupedReservations = useGroupedMailReservations();

  const filtered = useMemo(() => {
    if (!search.status) {
      return groupedReservations;
    }
    return groupedReservations.filter((item) => item.status === search.status);
  }, [groupedReservations, search.status]);

  const {
    items: paginatedMails,
    page,
    totalPages,
  } = usePaginatedItems(filtered, {
    currentPage: search.page ?? 1,
    pageSize: 10,
  });

  const onStatusChange = (v: MailStatusNameType) => {
    setters.status(invert(mailStatusNameMap)[v]);
    setters.page(undefined);
  };

  return (
    <>
      <Table className="px-3 pb-4" rowCount={paginatedMails.length}>
        <Table.Head>
          <Table.Th className="min-w-60">메일 제목</Table.Th>
          <Table.ThSelect
            items={mailStatusNames}
            onValueChange={onStatusChange}
            placeholder="상태"
            value={search.status ? mailStatusNameMap[search.status] : undefined}
          />
          <Table.Th>발신자</Table.Th>
          <Table.Th>수신자</Table.Th>
          <Table.Th>예약 시간</Table.Th>
          <Table.Th />
        </Table.Head>
        <Table.Body>
          {paginatedMails.map((item, idx) => {
            return (
              <Table.Row key={`${item.mailId}-${idx}`}>
                <Table.Cell className="min-w-60">{item.mailSubject || '(제목 없음)'}</Table.Cell>
                <Table.Cell>
                  <MailStatusBadge status={item.status} />
                </Table.Cell>
                <Table.Cell>{item.senderNickname}</Table.Cell>
                <Table.Cell>
                  <MailReceiversText receivers={item.receivers} />
                </Table.Cell>
                <Table.Cell>
                  {formatTemplates['(2026년)? 1월 1일, 오후 11:00'](item.reservationTime)}
                </Table.Cell>
                <Table.Cell>
                  <Menu>
                    <Menu.Trigger asChild>
                      <IconButton size="sm" variant="dimmed">
                        <MdMoreHoriz className="size-4.5" />
                      </IconButton>
                    </Menu.Trigger>
                    <Menu.Content align="end">
                      <Menu.ButtonItem>Todo: 백엔드 mailid 개선 완료 시 구현 예정</Menu.ButtonItem>
                    </Menu.Content>
                  </Menu>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {paginatedMails.length === 0 && (
        <Result
          description="아직 발송된 메일이 없어요."
          figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
          title="메일 내역이 없어요"
        />
      )}
      <div className="mt-5 flex w-full justify-end">
        <Pagination
          currentPage={page}
          onPageChange={(p) => setters.page(p)}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};
