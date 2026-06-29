import { Badge } from '@yourssu-inhouse/interior';

import type { MailReservationStatusType } from '@/apis/mails/schema';

import { mailStatusNameMap } from '@/types/mails';

interface MailStatusBadgeProps {
  status: MailReservationStatusType;
}

export const MailStatusBadge = ({ status }: MailStatusBadgeProps) => {
  return (
    <Badge color={mailStatusColorMap[status]} size="md">
      {mailStatusNameMap[status]}
    </Badge>
  );
};

const mailStatusColorMap = {
  SCHEDULED: 'yellow',
  SENT: 'green',
  PENDING_SEND: 'red',
} as const;
