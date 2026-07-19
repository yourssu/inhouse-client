import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { InlineButton } from '@yourssu-inhouse/interior';
import clsx from 'clsx';
import { differenceInMinutes } from 'date-fns';
import { useState } from 'react';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { MdLocationOn } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useLocationEditDialog } from '@/routes/~_auth/~recruit/~schedules/components/hooks/useLocationEditDialog';
import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { partColorMap, partNameKo } from '@/types/parts';

interface WeeklyScheduleItemProps {
  applicant: ApplicantType;
  schedule: InterviewScheduleType;
}

export const WeeklyScheduleItem = ({ applicant, schedule }: WeeklyScheduleItemProps) => {
  const color = partColorMap[schedule.part];
  const duration = differenceInMinutes(schedule.endTime, schedule.startTime);

  const openLocationEditDialog = useLocationEditDialog(schedule);

  const [isCompact, setIsCompact] = useState(false);
  const ref = useResizeObserver((entry) => {
    setIsCompact(entry.contentRect.height < 48);
  });

  return (
    <ScheduleTooltip>
      <ScheduleTooltip.Trigger>
        <div
          className="border-lightBackground h-[calc(100%-2px)] w-full cursor-pointer overflow-hidden rounded-lg border-2 px-2.5 pt-1.5 pb-0.5 hover:brightness-90"
          ref={ref}
          style={{
            backgroundColor: color.light,
          }}
        >
          <div
            className={clsx(
              'flex',
              isCompact ? 'flex-row items-center gap-1.5' : 'flex-col items-start gap-0',
            )}
          >
            <div className="shrink-0 text-sm font-semibold">{schedule.name}</div>
            <div className="text-greyOpacity700 truncate text-xs font-medium">
              {partNameKo[schedule.part]}
            </div>
          </div>
        </div>
      </ScheduleTooltip.Trigger>
      <ScheduleTooltip.Content
        applicant={applicant}
        contentProps={{ side: 'left', sideOffset: 10 }}
      >
        <ScheduleTooltip.Item icon={BiSolidCalendarCheck}>
          {formatTemplates['1월 1일 (월) 23:00'](schedule.startTime)} ~{' '}
          {formatTemplates['23:00'](schedule.endTime)} ({duration}분)
        </ScheduleTooltip.Item>
        <ScheduleTooltip.Item
          icon={MdLocationOn}
          right={
            <InlineButton className="text-violet500" onClick={openLocationEditDialog}>
              수정
            </InlineButton>
          }
        >
          {schedule.locationDetail == null
            ? schedule.locationType
            : `${schedule.locationType} (${schedule.locationDetail})`}
        </ScheduleTooltip.Item>
      </ScheduleTooltip.Content>
    </ScheduleTooltip>
  );
};
