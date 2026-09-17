import * as styles from '@/components/DatePicker/DatePicker.css';
import { weekDaysKo } from '@/components/DatePicker/utils';

export const DateGridHeader = () => {
  return (
    <div className={styles.gridHeader}>
      {weekDaysKo.map((day) => (
        <div className={styles.gridHeaderCell} key={day}>
          {day}
        </div>
      ))}
    </div>
  );
};
