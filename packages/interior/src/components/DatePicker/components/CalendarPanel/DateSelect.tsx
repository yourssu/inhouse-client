import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { isSameMonth, isSameYear } from 'date-fns';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Popover } from '../../../Popover';
import * as styles from '../../DatePicker.css';

interface DateSelectProps {
  currentDate: Date;
  dates: Date[];
  onChange: (date: Date) => void;
}

export const DateSelect = ({ dates, onChange, currentDate }: DateSelectProps) => {
  return (
    <Popover>
      <Popover.Trigger>
        <button className={styles.selectTrigger} type="button">
          {formatTemplates['2026. 1.'](currentDate)}
          <MdKeyboardArrowDown className={styles.selectArrow} />
        </button>
      </Popover.Trigger>
      <Popover.Content align="start" className={styles.selectMenu} sideOffset={4}>
        <div>
          {dates.map((v) => {
            const selected = isSameYear(v, currentDate) && isSameMonth(v, currentDate);
            return (
              <Popover.Closeable asChild key={v.toISOString()}>
                <button
                  className={styles.selectOption({ selected })}
                  onClick={() => onChange(v)}
                  type="button"
                >
                  {formatTemplates['2026년 1월'](v)}
                </button>
              </Popover.Closeable>
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );
};
