import * as Tooltip from '@radix-ui/react-tooltip';
import { InlineButton } from '@yourssu-inhouse/interior';
import { type DateArg, differenceInMinutes } from 'date-fns';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { MdLocationOn } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';

import { useAlertDialog } from '@/hooks/useAlertDialog';
import { LocationDialogContent } from '@/routes/~_auth/~recruit/~schedules/components/LocationDialogContent';
import { partNameKo } from '@/types/parts';
import { formatTemplates } from '@/utils/date';
import { formatSemester } from '@/utils/semester';

interface ScheduleTooltipProps {
  actionTextContent?: string;
  applicant: ApplicantType;
  contentProps?: Tooltip.TooltipContentProps;
  endTime: DateArg<Date>;
  locationDetail?: null | string;
  locationType?: string;
  scheduleId?: number;
  startTime: DateArg<Date>;
}

export const ScheduleTooltip = ({
  applicant,
  children,
  actionTextContent,
  startTime,
  endTime,
  contentProps,
  locationDetail,
  locationType,
  scheduleId,
}: React.PropsWithChildren<ScheduleTooltipProps>) => {
  const openAlertDialog = useAlertDialog();
  const duration = differenceInMinutes(endTime, startTime);
  const hasScheduleLocation = !!(locationType && scheduleId);

  const handleLocation = async (scheduleId: number) => {
    await openAlertDialog({
      title: '면접 장소 변경하기',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <LocationDialogContent
          closeAsFalse={closeAsFalse}
          closeAsTrue={closeAsTrue}
          scheduleId={scheduleId}
        />
      ),
      customized: true,
    });
  };

  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            align="start"
            className="bg-backgroundLevel02 shadow-tooltip z-20 min-w-60 rounded-[14px] px-5.5 py-4.5"
            side="bottom"
            sideOffset={5}
            {...contentProps}
          >
            <div className="text-15 flex flex-col gap-4.5">
              <div className="flex flex-col gap-0.5">
                <div className="text-17 font-semibold">{applicant.name}</div>
                <div className="text-neutralSubtle text-13">
                  {applicant.age}세 · {formatSemester(applicant.semester)}
                </div>
                <div className="text-neutralSubtle text-13">
                  <span>{partNameKo[applicant.part]} 파트</span>
                  <span className="ml-1">
                    {formatTemplates['1월 1일'](applicant.applicationDate)}에 지원
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <BiSolidCalendarCheck className="text-neutralDisabled size-6" />
                  <span>
                    {formatTemplates['1월 1일 (월) 23:00'](startTime)} ~{' '}
                    {formatTemplates['23:00'](endTime)} ({duration}분)
                  </span>
                </div>
                {hasScheduleLocation && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MdLocationOn className="text-neutralDisabled size-6" />
                      <span>
                        {locationDetail ? `${locationType} (${locationDetail})` : locationType}
                      </span>
                    </div>
                    <InlineButton
                      className="text-violet500"
                      onClick={() => handleLocation(scheduleId)}
                    >
                      수정
                    </InlineButton>
                  </div>
                )}
              </div>
              {actionTextContent && (
                <span className="text-violet600 text-13">{actionTextContent}</span>
              )}
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
