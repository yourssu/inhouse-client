import clsx from 'clsx';
import { differenceInMinutes } from 'date-fns';
import { useState } from 'react';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { MdLocationOn } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { LocationDialogContent } from '@/routes/~_auth/~recruit/~schedules/components/LocationDialogContent';
import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { partColorMap, partNameKo } from '@/types/parts';
import { formatTemplates } from '@/utils/date';

interface WeeklyScheduleItemProps {
  applicant: ApplicantType;
  schedule: InterviewScheduleType;
}

export const WeeklyScheduleItem = ({ applicant, schedule }: WeeklyScheduleItemProps) => {
  const color = partColorMap[schedule.part];
  const duration = differenceInMinutes(schedule.endTime, schedule.startTime);

  const openAlertDialog = useAlertDialog();
  const handleLocationEdit = async () => {
    await openAlertDialog({
      title: '면접 장소 변경하기',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <LocationDialogContent
          closeAsFalse={closeAsFalse}
          closeAsTrue={closeAsTrue}
          scheduleId={schedule.id}
        />
      ),
      customized: true,
    });
  };

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
        <ScheduleTooltip.Item icon={MdLocationOn} right={{ label: '수정', onClick: handleLocationEdit }}>
          {schedule.locationDetail == null
            ? schedule.locationType
            : `${schedule.locationType} (${schedule.locationDetail})`}
        </ScheduleTooltip.Item>
      </ScheduleTooltip.Content>
    </ScheduleTooltip>
  );
};
