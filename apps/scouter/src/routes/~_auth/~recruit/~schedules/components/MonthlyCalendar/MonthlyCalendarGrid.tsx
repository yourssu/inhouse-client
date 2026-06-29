import { compareAsc, getMonth, getYear, isSameDay } from 'date-fns';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { MonthlyCalendarDayCell } from '@/routes/~_auth/~recruit/~schedules/components/MonthlyCalendar/MonthlyCalendarDayCell';
import { generateMonthlyCalendarDates } from '@/routes/~_auth/~recruit/~schedules/utils/calendar';

interface MonthlyCalendarGridProps {
  applicants: ApplicantType[];
  date: Date;
  schedules: InterviewScheduleType[];
}

export const MonthlyCalendarGrid = ({ date, schedules, applicants }: MonthlyCalendarGridProps) => {
  const year = getYear(date);
  const month = getMonth(date);
  const weeks = generateMonthlyCalendarDates(year, month);

  const getDateSchedules = (date: Date) =>
    schedules
      .filter(({ startTime }) => isSameDay(startTime, date))
      .toSorted((a, b) => compareAsc(a.startTime, b.startTime));

  return (
    <div className="mt-2 flex w-full flex-col">
      {weeks.map((week, weekIndex) => (
        <div className="flex w-full" key={weekIndex}>
          {week.map(({ date, state }) => (
            <MonthlyCalendarDayCell
              applicants={applicants}
              date={date}
              key={date.toISOString()}
              schedules={getDateSchedules(date)}
              state={state}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
