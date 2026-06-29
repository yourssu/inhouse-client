import { SegmentedControl } from '@yourssu-inhouse/interior';
import { startTransition } from 'react';

import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import {
  MonthlyIndicator,
  WeeklyIndicator,
} from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper/DateIndicator';
import {
  DivisionLegend,
  PartLegend,
} from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper/Legend';

const Body = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="flex flex-col">{children}</div>;
};

const DurationSegmentedControl = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/schedules/' });
  const setCalendarType = useSetStateSelector(setSearch, 'ct');

  return (
    <SegmentedControl
      id="schedule-calendar"
      items={['월별', '주별']}
      onValueChange={(value) => startTransition(() => setCalendarType(value))}
      value={search.ct}
    />
  );
};

const HeaderRow = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="flex w-full items-center justify-between">{children}</div>;
};

const PaperHeader = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="bg-lightBackground sticky top-0 z-30 flex flex-col py-6">{children}</div>;
};

export const CalendarPaper = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <div className="flex-[1_1_0] pb-9">
      <div className="bg-lightBackground rounded-2xl p-6 pt-0">{children}</div>
    </div>
  );
};

CalendarPaper.Header = PaperHeader;
CalendarPaper.HeaderRow = HeaderRow;
CalendarPaper.DivisionLegend = DivisionLegend;
CalendarPaper.PartLegend = PartLegend;
CalendarPaper.DurationSegmentedControl = DurationSegmentedControl;
CalendarPaper.WeeklyIndicator = WeeklyIndicator;
CalendarPaper.MonthlyIndicator = MonthlyIndicator;
CalendarPaper.Body = Body;
