import { useSuspenseQueries } from '@tanstack/react-query';
import { compareDesc } from 'date-fns';

import type { MailReservationItem } from '@/apis/mails/schema';

import { mailReservationsOption } from '@/apis/mails/query';
import { activeMembersOption } from '@/apis/members/query';

export type GroupedMailReservation = Omit<
  MailReservationItem,
  'primaryReceiverEmailAddress' | 'reservationId'
> & {
  receivers: string[];
  senderNickname: string;
};

export const useGroupedMailReservations = () => {
  const [{ data: reservations }, { data: membersRes }] = useSuspenseQueries({
    queries: [mailReservationsOption(), activeMembersOption()],
  });

  const activeMembers = membersRes.members;

  const grouped = reservations.items.reduce<Record<string, GroupedMailReservation>>((acc, item) => {
    const key = `${item.mailSubject}|${item.senderEmailAddress}|${item.reservationTime}`;
    if (!acc[key]) {
      const sender = activeMembers.find((m) => m.email === item.senderEmailAddress);
      const senderNickname = sender?.nickname ?? item.senderEmailAddress;

      acc[key] = {
        mailId: item.mailId,
        reservationTime: item.reservationTime,
        status: item.status,
        senderEmailAddress: item.senderEmailAddress,
        mailSubject: item.mailSubject,
        attachmentReferences: item.attachmentReferences,
        senderNickname,
        receivers: [],
      };
    }
    if (item.primaryReceiverEmailAddress) {
      acc[key].receivers.push(item.primaryReceiverEmailAddress);
    }
    return acc;
  }, {});

  return Object.values(grouped).toSorted((a, b) =>
    compareDesc(a.reservationTime, b.reservationTime),
  );
};
