import { getMonth, getYear } from 'date-fns';

import * as styles from '@/components/DatePicker/DatePicker.css';
import { getCalendarDays } from '@/components/DatePicker/utils';

import { DateGridCell } from './DateGridCell';

interface DateGridProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onDateHover?: (date: Date | null) => void;
}

export const DateGrid = ({ currentDate, onDateClick, onDateHover }: DateGridProps) => {
  const days = getCalendarDays(getYear(currentDate), getMonth(currentDate));

  return (
    <div className={styles.grid}>
      {days.map((date, i) => {
        if (!date) {
          return <div className={styles.emptyCell} key={`empty-${i}`} />;
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
