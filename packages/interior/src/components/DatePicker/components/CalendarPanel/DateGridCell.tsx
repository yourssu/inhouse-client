import { isToday } from 'date-fns';

import * as styles from '../../DatePicker.css';
import { useDateStatus } from '../../hooks/useDateStatus';

interface DateGridCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date;
}

export const DateGridCell = ({ date, ...props }: DateGridCellProps) => {
  const { status, type } = useDateStatus(date);

  const isRangeStart = status === 'selected' && type === 'start';
  const isRangeEnd = status === 'selected' && type === 'end';

  return (
    <div className={styles.cellContainer} key={date.toISOString()}>
      <button
        className={styles.cellButton}
        disabled={status === 'disabled'}
        type="button"
        {...props}
      >
        {isRangeStart && <div className={styles.rangeBackdrop({ position: 'start' })} />}
        {isRangeEnd && <div className={styles.rangeBackdrop({ position: 'end' })} />}
        {isToday(date) && <span className={styles.todayDot({ selected: status === 'selected' })} />}
        <div className={styles.cellStyle({ status })}>{date.getDate()}</div>
      </button>
    </div>
  );
};
