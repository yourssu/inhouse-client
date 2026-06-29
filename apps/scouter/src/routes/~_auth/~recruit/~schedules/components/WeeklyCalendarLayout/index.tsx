import clsx from 'clsx';
import { isSameDay, isToday } from 'date-fns';
import { type ReactNode } from 'react';

import {
  useWeeklyCalendarLayoutContext,
  WeeklyCalendarLayoutContext,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/context';
import {
  hourHeight,
  hours,
  startHour,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';
import { generateWeeklyCalendarDates } from '@/routes/~_auth/~recruit/~schedules/utils/calendar';
import { formatTemplates } from '@/utils/date';

const WeeklyCalendarHeader = ({ top = 96 }: { top?: number }) => {
  const { displayDates } = useWeeklyCalendarLayoutContext();

  return (
    <div className="sticky z-30 flex w-full" style={{ top }}>
      <div className="bg-lightBackground w-15 shrink-0" />
      <div className="calendar-header-lighting-gradient flex flex-1">
        {displayDates.map((d) => (
          <div
            className="bg-lightBackground border-l-lightBackground border-b-grey200 flex flex-1 flex-col items-center justify-center border-b border-l py-2"
            key={d.toISOString()}
          >
            <span
              className={clsx(
                'text-neutralMuted text-15 font-medium select-none',
                isToday(d) && 'text-violet500',
              )}
            >
              {formatTemplates['1.1 (월)'](d)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeeklyCalendarTimeColumn = () => {
  return (
    <div className="w-15 shrink-0 pt-2">
      {hours.map((hour) => (
        <div
          className="text-neutralSubtle flex items-start justify-center text-xs select-none"
          key={hour}
          style={{ height: hourHeight }}
        >
          <span className="-mt-2 px-1">{hour > 12 ? `오후 ${hour - 12}시` : `오전 ${hour}시`}</span>
        </div>
      ))}
    </div>
  );
};

const WeeklyCalendarDayColumn = ({
  date,
  children,
}: {
  children: (date: Date) => ReactNode;
  date: Date;
}) => {
  const dimmed = isToday(date);

  return (
    <div
      className="border-grey200 relative flex-1 border-b pt-2 first:*:border-l-0"
      style={{ height: hours.length * hourHeight + 8 }}
    >
      {hours.map((hour) => (
        <div
          className={clsx(
            'border-grey200 absolute w-full border-b border-l',
            dimmed && 'bg-greyOpacity50',
          )}
          key={hour}
          style={{
            top: (hour - startHour) * hourHeight + 8,
            height: hourHeight,
          }}
        >
          <div className="border-grey100 h-1/2 w-full border-b" />
        </div>
      ))}
      {children(date)}
    </div>
  );
};

const WeeklyCalendarBody = ({
  children,
  indicator,
}: {
  children: (date: Date) => React.ReactNode;
  indicator?: React.ReactNode;
}) => {
  const { displayDates } = useWeeklyCalendarLayoutContext();

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1">
        <WeeklyCalendarTimeColumn />
        {displayDates.map((d) => (
          <WeeklyCalendarDayColumn date={d} key={d.toISOString()}>
            {children}
          </WeeklyCalendarDayColumn>
        ))}
      </div>
      <div className="h-6 w-full" />
      {indicator}
    </div>
  );
};

export const WeeklyCalendarLayout = ({
  displayDate,
  filteredDates,
  children,
}: React.PropsWithChildren<{
  displayDate: Date;
  filteredDates?: Date[];
}>) => {
  const weekDates = generateWeeklyCalendarDates(displayDate);
  const displayDates = filteredDates
    ? weekDates.filter((d) => filteredDates.some((fd) => isSameDay(fd, d)))
    : weekDates;

  return (
    <WeeklyCalendarLayoutContext.Provider value={{ displayDates }}>
      <div className="flex w-full flex-col">{children}</div>
    </WeeklyCalendarLayoutContext.Provider>
  );
};

WeeklyCalendarLayout.Header = WeeklyCalendarHeader;
WeeklyCalendarLayout.Body = WeeklyCalendarBody;
