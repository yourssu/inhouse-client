import { differenceInMinutes, getSeconds, setHours, setMinutes, startOfDay } from 'date-fns';
import { clamp } from 'es-toolkit';
import { useEffect, useRef, useState } from 'react';

import {
  endHour,
  hourHeight,
  startHour,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';
import { formatTemplates } from '@/utils/date';

export const CurrentTimeIndicator = () => {
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    const msUntilNextMinute = (60 - getSeconds(new Date())) * 1000;

    const timeout = setTimeout(() => {
      setNow(new Date());
      intervalRef.current = setInterval(() => {
        setNow(new Date());
      }, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const minutesFromStart = clamp(
    differenceInMinutes(now, setMinutes(setHours(startOfDay(now), startHour), 0)),
    0,
    (endHour - startHour) * 60,
  );
  const indicatorTop = (minutesFromStart / 60) * hourHeight;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        top: `calc(${indicatorTop}px + 0.5rem)`,
        left: '60px',
        right: 0,
      }}
    >
      <div className="bg-violet500 absolute top-0 h-[2px] w-full -translate-y-1/2" />
      <div className="absolute top-0 -left-[60px] flex w-[60px] -translate-y-1/2 justify-end">
        <span className="bg-violet500 rounded px-2 py-0.5 text-xs text-white">
          {formatTemplates['23:00'](now)}
        </span>
      </div>
    </div>
  );
};
