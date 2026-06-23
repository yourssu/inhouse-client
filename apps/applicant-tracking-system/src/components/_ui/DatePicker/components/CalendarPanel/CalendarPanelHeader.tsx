import { addMonths, compareDesc, getYear } from 'date-fns';
import { monthsInYear } from 'date-fns/constants';
import { range } from 'es-toolkit';
import { useMemo } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import { DateSelect } from '@/components/_ui/DatePicker/components/CalendarPanel/DateSelect';
import { IconButton } from '@/components/_ui/IconButton';

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
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-1">
        <DateSelect
          currentDate={displayDate}
          dates={selectableDates}
          onChange={onChangeDisplayDate}
        />
      </div>

      {showNavigation && (
        <div className="flex">
          <IconButton onClick={() => onChangeDisplayDate(addMonths(displayDate, -1))} size="xxs">
            <MdChevronLeft className="text-neutralSubtle size-5" />
          </IconButton>

          <IconButton onClick={() => onChangeDisplayDate(addMonths(displayDate, 1))} size="xxs">
            <MdChevronRight className="text-neutralSubtle size-5" />
          </IconButton>
        </div>
      )}
    </div>
  );
};
