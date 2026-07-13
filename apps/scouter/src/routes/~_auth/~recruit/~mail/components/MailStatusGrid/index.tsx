import { useSuspenseQuery } from '@tanstack/react-query';
import { AiFillClockCircle } from 'react-icons/ai';
import { IoMdAlert } from 'react-icons/io';
import { MdSend } from 'react-icons/md';

import { mailReservationGroupsOption } from '@/apis/mails/query';
import { MailStatusPaper } from '@/routes/~_auth/~recruit/~mail/components/MailStatusGrid/MailStatusPaper';

const Skeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MailStatusPaper.Skeleton />
      <MailStatusPaper.Skeleton />
      <MailStatusPaper.Skeleton />
    </div>
  );
};

export const MailStatusGrid = () => {
  const {
    data: { groups: reservationGroups },
  } = useSuspenseQuery(mailReservationGroupsOption());

  const scheduledCount = reservationGroups.filter((item) => item.status === 'SCHEDULED').length;
  const sentCount = reservationGroups.filter((item) => item.status === 'SENT').length;
  const failCount = reservationGroups.filter((item) => item.status === 'PENDING_SEND').length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <MailStatusPaper
        color="orange"
        icon={<AiFillClockCircle className="size-6" />}
        label="예약된 메일"
      >
        {scheduledCount}건
      </MailStatusPaper>
      <MailStatusPaper color="blue" icon={<MdSend className="size-6" />} label="발송된 메일">
        {sentCount}건
      </MailStatusPaper>
      <MailStatusPaper
        color="red"
        icon={<IoMdAlert className="size-6" />}
        label="발송 실패"
        tooltipContent="시스템 오류나 인증 문제 등 예상치 못한 이유로 발송되지 않은 경우에요. 이 경우, 전송이 완료될 때까지 자동으로 재시도해요."
      >
        {failCount}건
      </MailStatusPaper>
    </div>
  );
};

MailStatusGrid.Skeleton = Skeleton;
