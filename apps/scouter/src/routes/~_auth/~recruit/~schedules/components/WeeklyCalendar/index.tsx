import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { partsOption } from '@/apis/parts/query';
import { interviewSchedulesOption } from '@/apis/schedule/query';
import { useSearchState } from '@/hooks/useSearchState';
import { CalendarPaper } from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper';
import { WeeklyCalendarGrid } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendar/WeeklyCalendarGrid';

export const WeeklyCalendar = () => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [search] = useSearchState({ from: '/_auth/recruit/schedules/' });
  const [{ data: allSchedules }, { data: parts }] = useSuspenseQueries({
    queries: [
      {
        ...interviewSchedulesOption(),
        staleTime: 1000 * 60 * 10,
      },
      partsOption(),
    ],
  });
  const part = parts.find((p) => p.partId === search.pid);

  const schedules = useMemo(() => {
    if (!search.pid || !part) {
      return allSchedules;
    }
    return allSchedules.filter((s) => s.part === part.partName);
  }, [allSchedules, search.pid, part]);

  return (
    <CalendarPaper>
      <CalendarPaper.Header>
        <CalendarPaper.HeaderRow>
          <CalendarPaper.WeeklyIndicator date={displayDate} onDateChange={setDisplayDate} />
          <CalendarPaper.DurationSegmentedControl />
        </CalendarPaper.HeaderRow>
        <CalendarPaper.PartLegend />
      </CalendarPaper.Header>
      <CalendarPaper.Body>
        <WeeklyCalendarGrid displayDate={displayDate} schedules={schedules} />
      </CalendarPaper.Body>
    </CalendarPaper>
  );
};
