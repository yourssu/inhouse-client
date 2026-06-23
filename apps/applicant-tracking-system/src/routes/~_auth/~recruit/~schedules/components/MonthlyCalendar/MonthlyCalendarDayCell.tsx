import clsx from 'clsx';
import { getDate, isSunday, isToday } from 'date-fns';
import { assert } from 'es-toolkit';
import { useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';
import type { MonthlyCalendarDateState } from '@/routes/~_auth/~recruit/~schedules/utils/calendar';

import { MonthlyScheduleItem } from '@/routes/~_auth/~recruit/~schedules/components/MonthlyCalendar/MonthlyScheduleItem';
import { tv } from '@/utils/tw';

interface MonthlyCalendarDayCellProps {
  applicants: ApplicantType[];
  date: Date;
  schedules: InterviewScheduleType[];
  state: MonthlyCalendarDateState;
}

const day = tv({
  base: 'text-15 font-medium',
  variants: {
    type: {
      today: 'text-violet600',
      sunday: 'text-red500',
      otherMonth: 'text-grey400',
      normal: 'text-neutralMuted',
    },
  },
});

export const MonthlyCalendarDayCell = ({
  date,
  state,
  schedules,
  applicants,
}: MonthlyCalendarDayCellProps) => {
  const [showAllSchedules, setShowAllSchedules] = useState(false);

  const visibleSchedules = showAllSchedules ? schedules : schedules.slice(0, 3);

  const getDayVariants = () => {
    if (state !== '이번달') {
      return 'otherMonth';
    }
    if (isToday(date)) {
      return 'today';
    }
    if (isSunday(date)) {
      return 'sunday';
    }
    return 'normal';
  };

  return (
    <div
      className={clsx(
        'flex min-h-30 min-w-25 flex-[1_1] flex-col gap-1 rounded-lg border p-2',
        isToday(date) ? 'bg-grey50 border-greyOpacity100' : 'border-transparent',
      )}
    >
      <div className="flex items-start justify-between">
        <span className={day({ type: getDayVariants() })}>
          {getDate(date)}
          {isToday(date) && <span className="ml-1">오늘</span>}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {visibleSchedules.map((schedule) => {
          const applicant = applicants.find(({ name }) => name === schedule.name);
          assert(!!applicant, `지원자를 찾을 수 없어요: ${schedule.name}`);
          return (
            <MonthlyScheduleItem applicant={applicant} key={schedule.id} schedule={schedule} />
          );
        })}
        {schedules.length > 3 && !showAllSchedules && (
          <button
            className="text-neutralDisabled hover:bg-greyOpacity100 ease-ease h-7 cursor-pointer rounded-lg px-1.5 text-left text-xs transition-colors"
            onClick={() => setShowAllSchedules(true)}
          >
            + {schedules.length - 3}개 더보기
          </button>
        )}
      </div>
    </div>
  );
};
