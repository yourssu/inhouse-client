import * as styles from '../../DatePicker.css';
import { weekDaysKo } from '../../utils';

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
