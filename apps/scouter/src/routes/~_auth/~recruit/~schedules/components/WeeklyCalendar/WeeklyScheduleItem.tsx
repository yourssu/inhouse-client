import clsx from 'clsx';
import { useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useResizeObserver } from '@/hooks/useResizeObserver';
import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { partColorMap, partNameKo } from '@/types/parts';

interface WeeklyScheduleItemProps {
  applicant: ApplicantType;
  schedule: InterviewScheduleType;
}

export const WeeklyScheduleItem = ({ applicant, schedule }: WeeklyScheduleItemProps) => {
  const color = partColorMap[schedule.part];

  const [isCompact, setIsCompact] = useState(false);
  const ref = useResizeObserver((entry) => {
    setIsCompact(entry.contentRect.height < 48);
  });

  return (
    <ScheduleTooltip
      applicant={applicant}
      contentProps={{ side: 'left', sideOffset: 10 }}
      endTime={schedule.endTime}
      startTime={schedule.startTime}
    >
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
    </ScheduleTooltip>
  );
};
