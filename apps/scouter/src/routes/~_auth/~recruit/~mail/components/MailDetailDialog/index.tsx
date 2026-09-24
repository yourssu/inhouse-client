import { Dialog, IconButton } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';

import type { MailReservationGroupsResponse } from '@/apis/mails/schema';

import { MailReservationContent } from './MailReservationContent';

interface MailDetailDialogProps {
  close: () => void;
  group: MailReservationGroupsResponse['groups'][number];
  isOpen: boolean;
}

export const MailDetailDialog = ({ group, isOpen, close }: MailDetailDialogProps) => {
  const [selectedId, setSelectedId] = useState(group.mails[0]?.reservationId);

  return (
    <Dialog
      closeableWithOutside
      contentProps={{
        'aria-label': '메일 상세',
        className: 'w-[min(960px,calc(100vw-40px))]',
      }}
      onClose={close}
      open={isOpen}
    >
      <div className="flex h-[min(720px,85dvh)] flex-col">
        <Dialog.Header>
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title>메일 상세</Dialog.Title>
            <IconButton aria-label="메일 상세 닫기" onClick={close} size="md" type="button">
              <MdClose className="size-5" />
            </IconButton>
          </div>
        </Dialog.Header>
        <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 py-5 sm:flex-row">
          {group.mails.length > 1 && (
            <aside
              aria-label="수신자 목록"
              className="border-greyOpacity200 flex max-h-44 shrink-0 flex-col gap-3 border-b pb-3 sm:max-h-none sm:w-56 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0"
            >
              <p className="text-neutral text-sm font-medium">수신자 {group.mails.length}명</p>
              <ul className="mt-0! min-h-0 flex-1 overflow-y-auto">
                {group.mails.map((mail) => (
                  <li className="mt-1! pl-0! before:hidden!" key={mail.reservationId}>
                    <button
                      aria-pressed={selectedId === mail.reservationId}
                      className={clsx(
                        'focus-visible:outline-violet500 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm break-all focus-visible:outline-2',
                        selectedId === mail.reservationId
                          ? 'bg-greyOpacity100 text-neutral font-medium'
                          : 'text-neutralMuted hover:bg-greyOpacity50',
                      )}
                      onClick={() => setSelectedId(mail.reservationId)}
                      type="button"
                    >
                      {mail.receiverEmail}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <section
            aria-label="선택한 메일 내용"
            className="text-neutralSubtle min-h-0 min-w-0 flex-1 overflow-y-auto"
            key={selectedId}
          >
            {selectedId !== undefined ? (
              <MailReservationContent
                reservationId={selectedId}
                reserverEmail={group.reserverEmail}
                reserverName={group.reserverName}
              />
            ) : (
              <p className="text-neutralMuted">확인할 메일이 없어요.</p>
            )}
          </section>
        </div>
      </div>
    </Dialog>
  );
};
