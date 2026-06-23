import { getMonth, getYear } from 'date-fns';

import { DateGridCell } from '@/components/_ui/DatePicker/components/CalendarPanel/DateGridCell';
import { getCalendarDays } from '@/components/_ui/DatePicker/utils';

interface DateGridProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onDateHover?: (date: Date | null) => void;
}

export const DateGrid = ({ currentDate, onDateClick, onDateHover }: DateGridProps) => {
  const days = getCalendarDays(getYear(currentDate), getMonth(currentDate));

  return (
    <div className="grid grid-cols-7">
      {days.map((date, i) => {
        if (!date) {
          return <div className="size-8" key={`empty-${i}`} />;
        }
        return (
          <DateGridCell
            date={date}
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            onPointerEnter={() => onDateHover?.(date)}
            onPointerLeave={() => onDateHover?.(null)}
          />
        );
      })}
    </div>
  );
};
