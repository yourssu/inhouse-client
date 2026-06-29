import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { partColorMap, partNameKo } from '@/types/parts';
import { formatTemplates } from '@/utils/date';

interface MonthlyScheduleItemProps {
  applicant: ApplicantType;
  schedule: InterviewScheduleType;
}

export const MonthlyScheduleItem = ({ applicant, schedule }: MonthlyScheduleItemProps) => {
  const color = partColorMap[schedule.part];

  return (
    <ScheduleTooltip
      applicant={applicant}
      contentProps={{ side: 'left', sideOffset: 10 }}
      endTime={schedule.endTime}
      startTime={schedule.startTime}
    >
      <div className="hover:bg-greyOpacity100 text-neutralMuted flex cursor-pointer items-center gap-1.5 rounded p-0.5 text-xs font-medium">
        <div
          className="h-full w-1 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color.base }}
        />
        <span className="shrink-0" style={{ color: color.base }}>
          {partNameKo[schedule.part]}
        </span>
        <span className="shrink-0">{formatTemplates['23:00'](schedule.startTime)}</span>
        <span className="text-neutralSubtle flex-[1_1] overflow-hidden text-left break-all text-ellipsis whitespace-nowrap">
          {schedule.name}
        </span>
      </div>
    </ScheduleTooltip>
  );
};
