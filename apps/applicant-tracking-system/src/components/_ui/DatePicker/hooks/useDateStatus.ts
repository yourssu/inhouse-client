import { isAfter, isFuture, isSameDay } from 'date-fns';

import { useCalendarContext } from '@/components/_ui/DatePicker/context';
import { isInRange } from '@/components/_ui/DatePicker/utils';

type DateStatus =
  | {
      status: 'default';
      type?: undefined;
    }
  | {
      status: 'disabled';
      type?: undefined;
    }
  | {
      status: 'future';
      type?: undefined;
    }
  | {
      status: 'range';
      type?: undefined;
    }
  | {
      status: 'selected';
      type: 'end' | 'single' | 'start';
    };

export const useDateStatus = (date: Date): DateStatus => {
  const { minDate, maxDate, mode, rangeStart, rangeEnd, hoverDate, selectedDate } =
    useCalendarContext();

  const checkRange = (date: Date) => {
    const range = [rangeStart, rangeEnd ?? hoverDate] as const;
    if (range[0] === null || range[1] === null) {
      return false;
    }

    if (isAfter(range[0], range[1])) {
      return isInRange(date, range[1], range[0]);
    }
    return isInRange(date, range[0], range[1]);
  };

  const isDateDisabled = (date: Date): boolean => {
    return minDate && maxDate && !isInRange(date, minDate, maxDate);
  };

  const isStart = rangeStart && isSameDay(date, rangeStart);
  const isEnd = rangeEnd && isSameDay(date, rangeEnd);
  const isSingleSelected = mode === 'single' && selectedDate && isSameDay(date, selectedDate);
  const inRange = checkRange(date);

  if (isDateDisabled(date)) {
    return { status: 'disabled' };
  }
  if (isStart || isEnd || isSingleSelected) {
    const type = isStart ? 'start' : isEnd ? 'end' : 'single';
    return { status: 'selected', type };
  }
  if (inRange) {
    return { status: 'range' };
  }
  if (isFuture(date)) {
    return { status: 'future' };
  }
  return { status: 'default' };
};
