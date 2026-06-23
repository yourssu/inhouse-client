import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { applicantsOption } from '@/apis/applicants/query';
import { partsOption } from '@/apis/parts/query';
import { interviewSchedulesOption } from '@/apis/schedule/query';
import { useSearchState } from '@/hooks/useSearchState';
import { CalendarPaper } from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper';
import { MonthlyCalendarGrid } from '@/routes/~_auth/~recruit/~schedules/components/MonthlyCalendar/MonthlyCalendarGrid';
import { MonthlyCalendarHeader } from '@/routes/~_auth/~recruit/~schedules/components/MonthlyCalendar/MonthlyCalendarHeader';

export const MonthlyCalendar = () => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [search] = useSearchState({ from: '/_auth/recruit/schedules/' });
  // Todo: schedule에 applicantId를 포함하도록 백엔드 요청
  const [{ data: allSchedules }, { data: applicants }, { data: parts }] = useSuspenseQueries({
    queries: [
      {
        ...interviewSchedulesOption(),
        staleTime: 1000 * 60 * 10,
      },
      {
        ...applicantsOption(),
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
          <CalendarPaper.MonthlyIndicator date={displayDate} onDateChange={setDisplayDate} />
          <CalendarPaper.DurationSegmentedControl />
        </CalendarPaper.HeaderRow>
        <CalendarPaper.PartLegend />
      </CalendarPaper.Header>
      <CalendarPaper.Body>
        <MonthlyCalendarHeader />
        <MonthlyCalendarGrid applicants={applicants} date={displayDate} schedules={schedules} />
      </CalendarPaper.Body>
    </CalendarPaper>
  );
};
