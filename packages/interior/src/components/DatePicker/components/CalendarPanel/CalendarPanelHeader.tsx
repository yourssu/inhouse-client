import { addMonths, compareDesc, getYear } from 'date-fns';
import { monthsInYear } from 'date-fns/constants';
import { range } from 'es-toolkit';
import { useMemo } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import * as styles from '@/components/DatePicker/DatePicker.css';
import { IconButton } from '@/components/IconButton';

import { DateSelect } from './DateSelect';

interface CalendarPanelHeaderProps {
  displayDate: Date;
  onChangeDisplayDate: (date: Date) => void;
  showNavigation: boolean;
}

export const CalendarPanelHeader = ({
  displayDate,
  showNavigation,
  onChangeDisplayDate,
}: CalendarPanelHeaderProps) => {
  const currentYear = getYear(new Date());
  const selectableYears = range(currentYear - 10, currentYear + 10);
  const selectableDates = useMemo(() => {
    return selectableYears
      .flatMap((y) => range(1, monthsInYear + 1).map((m) => new Date(y, m, 1)))
      .toSorted(compareDesc);
  }, [selectableYears]);

  return (
    <div className={styles.panelHeader}>
      <div className={styles.panelHeaderSelectGroup}>
        <DateSelect
          currentDate={displayDate}
          dates={selectableDates}
          onChange={onChangeDisplayDate}
        />
      </div>

      {showNavigation && (
        <div className={styles.panelHeaderNav}>
          <IconButton onClick={() => onChangeDisplayDate(addMonths(displayDate, -1))} size="xxs">
            <MdChevronLeft className={styles.panelHeaderChevron} />
          </IconButton>

          <IconButton onClick={() => onChangeDisplayDate(addMonths(displayDate, 1))} size="xxs">
            <MdChevronRight className={styles.panelHeaderChevron} />
          </IconButton>
        </div>
      )}
    </div>
  );
};
