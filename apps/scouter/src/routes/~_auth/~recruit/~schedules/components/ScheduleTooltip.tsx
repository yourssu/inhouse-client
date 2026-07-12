import * as Tooltip from '@radix-ui/react-tooltip';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { type DateArg, differenceInMinutes } from 'date-fns';
import { BiSolidCalendarCheck } from 'react-icons/bi';

import type { ApplicantType } from '@/apis/applicants/schema';

import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

interface ScheduleTooltipProps {
  actionTextContent?: string;
  applicant: ApplicantType;
  contentProps?: Tooltip.TooltipContentProps;
  endTime: DateArg<Date>;
  startTime: DateArg<Date>;
}

export const ScheduleTooltip = ({
  applicant,
  children,
  actionTextContent,
  startTime,
  endTime,
  contentProps,
}: React.PropsWithChildren<ScheduleTooltipProps>) => {
  const duration = differenceInMinutes(endTime, startTime);

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
