import clsx from 'clsx';
import { differenceInMinutes, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns';
import { assert } from 'es-toolkit';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { DraftScheduleType } from '@/types/schedule';

import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import {
  minutesToPixelHeight,
  minutesToPixelTop,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/dragPosition';
import { ScheduleTooltip } from '@/routes/~_auth/~recruit/~schedules/components/ScheduleTooltip';
import { startHour } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';

interface DraftScheduleItemsProps {
  applicants: ApplicantType[];
  date: Date;
  isDragging: boolean;
}

/**
 * 특정 날짜의 드래프트 일정들을 렌더링하는 컴포넌트입니다.
 */
export const DraftScheduleItems = ({ date, applicants, isDragging }: DraftScheduleItemsProps) => {
  const { draftSchedules, activeApplicantId, setActiveApplicant, removeDraftSchedule } =
    useScheduleCreationContext();

  const daySchedules = draftSchedules.filter((s) => isSameDay(s.startTime, date));

  if (daySchedules.length === 0) {
    return null;
  }

  return (
    <>
      {daySchedules.map((schedule) => (
        <DraftScheduleItem
          applicants={applicants}
          isDragging={isDragging}
          isOther={schedule.applicantId !== activeApplicantId}
          key={schedule.applicantId}
          onRemove={() => removeDraftSchedule(schedule.applicantId)}
          onSwitchApplicant={() => setActiveApplicant(schedule.applicantId)}
          schedule={schedule}
        />
      ))}
    </>
  );
};

interface DraftScheduleItemProps {
  applicants: ApplicantType[];
  isDragging: boolean;
  isOther: boolean;
  onRemove: () => void;
  onSwitchApplicant: () => void;
  schedule: DraftScheduleType;
}

const DraftScheduleItem = ({
  schedule,
  applicants,
  isDragging,
  isOther,
  onRemove,
  onSwitchApplicant,
}: DraftScheduleItemProps) => {
  const startMinutes = differenceInMinutes(
    schedule.startTime,
    setMinutes(setHours(startOfDay(schedule.startTime), startHour), 0),
  );
  const durationMinutes = differenceInMinutes(schedule.endTime, schedule.startTime);
  const top = minutesToPixelTop(startMinutes + startHour * 60);
  const height = minutesToPixelHeight(durationMinutes);
  const applicant = applicants.find((a) => a.applicantId === schedule.applicantId);

  assert(!!applicant, `지원자를 찾을 수 없어요: ${schedule.applicantId}`);

  return (
    <ScheduleTooltip>
      <ScheduleTooltip.Trigger>
        <div
          className={clsx(
            'absolute right-0.5 left-0.5 rounded border-2 px-1 py-0.5 select-none',
            isOther
              ? 'bg-violet500 border-violet500 w-[60%] opacity-50'
              : 'bg-violet500 border-violet500',
            !isDragging &&
              'hover:bg-violet600 hover:border-violet600 ease-ease cursor-pointer transition-colors duration-200',
            isDragging && 'pointer-events-none',
          )}
          onClick={() => {
            if (isOther) {
              onSwitchApplicant();
            } else {
              onRemove();
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            top: `${top}px`,
            height: `${height}px`,
          }}
        >
          <span className="text-sm font-semibold text-white">{schedule.applicantName}</span>
        </div>
      </ScheduleTooltip.Trigger>
      <ScheduleTooltip.Content applicant={applicant}>
        <ScheduleTooltip.Time endTime={schedule.endTime} startTime={schedule.startTime} />
        <ScheduleTooltip.Action text={isOther ? '클릭으로 지원자 탭 이동' : '클릭으로 일정 제거'} />
      </ScheduleTooltip.Content>
    </ScheduleTooltip>
  );
};
