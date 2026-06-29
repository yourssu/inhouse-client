import { HoverTooltip } from '@yourssu-inhouse/interior';
import { InlineButton } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { MdMoreHoriz, MdOutlineHistory } from 'react-icons/md';
import { match, P } from 'ts-pattern';

import type { Member } from '@/apis/members/schema';

import { MemberHistoryBar } from '@/routes/~_auth/~members/~list/components/MemberHistoryTooltip/MemberHistoryBar';
import {
  formatSemesterRange,
  groupHistory,
} from '@/routes/~_auth/~members/~list/components/MemberHistoryTooltip/utils';
import { memberStateKo } from '@/types/member';

interface MemberHistoryTooltipProps {
  history: Member['history'];
  nickname: string;
}

export const MemberHistoryTooltip = ({
  history: memberHistory,
  nickname,
}: MemberHistoryTooltipProps) => {
  const { history } = groupHistory(memberHistory);

  return (
    <HoverTooltip
      content={
        <div className="flex flex-col">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <div className="text-neutralSubtle text-xs font-medium">{nickname}</div>
              <div className="text-17 font-semibold">활동 내역</div>
            </div>
            <div className="bg-blue50 flex size-10 items-center justify-center rounded-lg">
              <MdOutlineHistory className="text-blue500 size-6" />
            </div>
          </div>
          <div className="mb-5">
            <MemberHistoryBar history={memberHistory} />
          </div>
          <Table rowCount={history.length}>
            <Table.Head>
              <Table.Th className="w-auto min-w-auto">기간</Table.Th>
              <Table.Th className="w-auto min-w-auto">상태</Table.Th>
              <Table.Th className="w-auto min-w-auto">학기 수</Table.Th>
            </Table.Head>
            <Table.Body>
              {history.map((item) => (
                <Table.Row
                  className="nth-of-type-[2n+1]:bg-greyOpacity50"
                  key={item.semesters.join(',')}
                >
                  <Table.Cell className="w-auto min-w-auto">
                    {formatSemesterRange(item.semesters)}
                  </Table.Cell>
                  <Table.Cell className="w-auto min-w-auto">
                    {memberStateKo[item.status]}
                  </Table.Cell>
                  <Table.Cell className="w-auto min-w-auto">
                    {match(item.status)
                      .with(P.union('completed', 'withdrawn'), () => '-')
                      .otherwise(() => item.semesters.length)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      }
      contentProps={{ align: 'center', side: 'right', className: 'w-100 max-w-none' }}
      noArrow
    >
      <InlineButton className="-mr-1.5 flex items-center gap-0.5">
        {history.length}건 <MdMoreHoriz />
      </InlineButton>
    </HoverTooltip>
  );
};
