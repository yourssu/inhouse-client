import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { InlineButton } from '@yourssu-inhouse/interior';
import { differenceInMinutes } from 'date-fns';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { MdLocationOn } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useLocationEditDialog } from '@/routes/~_auth/~recruit/~schedules/components/hooks/useLocationEditDialog';
import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { partColorMap, partNameKo } from '@/types/parts';

interface MonthlyScheduleItemProps {
  applicant: ApplicantType;
  schedule: InterviewScheduleType;
}

export const MonthlyScheduleItem = ({ applicant, schedule }: MonthlyScheduleItemProps) => {
  const color = partColorMap[schedule.part];
  const duration = differenceInMinutes(schedule.endTime, schedule.startTime);

  const openLocationEditDialog = useLocationEditDialog(schedule);

  return (
    <ScheduleTooltip>
      <ScheduleTooltip.Trigger>
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
