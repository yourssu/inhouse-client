import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { isKyHTTPError } from '@yourssu-inhouse/inhouse-utils/ky';
import { Button } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { mailReservationDetailOption } from '@/apis/mails/query';
import { MailStatusBadge } from '@/routes/~_auth/~recruit/~mail/components/MailListTable/MailStatusBadge';
import { MailPreviewBody } from '@/routes/~_auth/~recruit/~mail/components/MailPreviewContent';

interface MailReservationContentProps {
  reservationId: number;
  reserverEmail: string;
  reserverName: string;
}

export const MailReservationContent = (props: MailReservationContentProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <MailReservationError error={error} onRetry={resetErrorBoundary} />
        )}
        onReset={reset}
        resetKeys={[props.reservationId]}
      >
        <Suspense fallback={<MailReservationSkeleton />}>
          <MailReservationDetail {...props} />
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

const MailReservationDetail = ({
  reservationId,
  reserverName,
  reserverEmail,
}: MailReservationContentProps) => {
  const { data } = useSuspenseQuery(mailReservationDetailOption(reservationId));

  return (
    <div className="flex min-h-full flex-col gap-6">
      <dl className="text-neutralSubtle grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutralMuted py-1">예약자</dt>
        <dd className="py-1 break-words">
          {reserverName}{' '}
          <span className="text-neutralMuted break-all">
            ({data.senderEmailAddress ?? reserverEmail})
          </span>
        </dd>
        <dt className="text-neutralMuted py-1">예약 시간</dt>
        <dd className="flex flex-wrap items-center gap-2 py-1">
          <span>{formatTemplates['(2026년)? 1월 1일, 오후 11:00'](data.reservationTime)}</span>
          <MailStatusBadge status={data.status} />
        </dd>
        {[
          { label: '받는사람', addresses: data.receiverEmailAddresses },
          { label: '참조', addresses: data.ccEmailAddresses },
          { label: '숨은참조', addresses: data.bccEmailAddresses },
        ]
          .filter(({ label, addresses }) => label === '받는사람' || addresses.length > 0)
          .map(({ label, addresses }) => (
            <div className="contents" key={label}>
              <dt className="text-neutralMuted py-1 whitespace-nowrap">
                {label}
                {label !== '받는사람' && ` (${addresses.length})`}
              </dt>
              <dd className="flex min-w-0 flex-wrap gap-1">
                {addresses.map((address) => (
                  <span
                    className="bg-greyOpacity100 rounded-8 px-2 py-1 font-medium break-all"
                    key={address}
                  >
                    {address}
                  </span>
                ))}
              </dd>
            </div>
          ))}
      </dl>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold break-words">{data.mailSubject || '(제목 없음)'}</h3>
          {data.mailBody ? (
            data.bodyFormat === 'HTML' ? (
              <MailPreviewBody html={data.mailBody} />
            ) : (
              <div className="text-15 break-words whitespace-pre-wrap">{data.mailBody}</div>
            )
          ) : (
            <p className="text-neutralMuted">메일 본문이 없어요.</p>
          )}
        </div>
        {data.attachmentReferences.length > 0 && (
          <div className="border-grey200 text-neutralSubtle mt-2 shrink-0 border-t pt-3">
            <p className="text-13 mb-1.5">첨부파일 ({data.attachmentReferences.length})</p>
            <ul>
              {data.attachmentReferences.map((attachment, index) => (
                <li className="text-sm break-words" key={`${attachment.storageKey}-${index}`}>
                  {attachment.fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const MailReservationSkeleton = () => (
  <div className="flex min-h-full flex-col gap-6" role="status">
    <span className="sr-only">메일 내용을 불러오고 있어요.</span>
    <div
      aria-hidden="true"
      className="grid w-full animate-pulse grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 motion-reduce:animate-none"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div className="contents" key={index}>
          <div className="bg-greyOpacity100 h-4 w-16 rounded" />
          <div className="bg-greyOpacity100 h-7 w-3/4 rounded-lg" />
        </div>
      ))}
    </div>
    <div aria-hidden="true" className="flex flex-1 flex-col gap-6">
      <div className="bg-greyOpacity100 h-7 w-2/3 animate-pulse rounded-lg motion-reduce:animate-none" />
      <div className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
        <div className="bg-greyOpacity100 h-4 w-1/3 rounded" />
        <div className="bg-greyOpacity100 h-4 w-full rounded" />
        <div className="bg-greyOpacity100 h-4 w-11/12 rounded" />
        <div className="bg-greyOpacity100 h-4 w-3/4 rounded" />
      </div>
    </div>
  </div>
);

interface MailReservationErrorProps {
  error: unknown;
  onRetry: () => void;
}

const MailReservationError = ({ error, onRetry }: MailReservationErrorProps) => {
  const status = isKyHTTPError(error) ? error.response.status : undefined;
  const message =
    status === 403
      ? '이 메일을 확인할 권한이 없어요.'
      : status === 404
        ? '메일 예약이 삭제되었거나 더 이상 찾을 수 없어요.'
        : '메일 내용을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';

  return (
    <div className="flex flex-col items-start gap-4 p-6">
      <p className="text-neutralMuted" role="alert">
        {message}
      </p>
      {status !== 403 && status !== 404 && (
        <Button onClick={onRetry} size="md" variant="secondary">
          다시 시도
        </Button>
      )}
    </div>
  );
};
