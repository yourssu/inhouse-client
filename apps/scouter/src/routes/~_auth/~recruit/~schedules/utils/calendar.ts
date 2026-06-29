import { addDays, endOfMonth, endOfWeek, startOfWeek } from 'date-fns';
import { range } from 'es-toolkit';

export type MonthlyCalendarDateState = '다음달' | '이번달' | '이전달';

export interface MonthlyCalendarDate {
  date: Date;
  state: MonthlyCalendarDateState;
}

export interface WeeklyCalendarDate {
  date: Date;
}

export const generateMonthlyCalendarDates = (
  year: number,
  month: number,
): MonthlyCalendarDate[][] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = endOfMonth(firstDayOfMonth);
  const firstDayOfView = startOfWeek(firstDayOfMonth);
  const lastDayOfView = endOfWeek(lastDayOfMonth);

  const getState = (date: Date): MonthlyCalendarDateState => {
    const dateMonth = date.getMonth();
    if (dateMonth < month || (month === 0 && dateMonth === 11)) {
      return '이전달';
    }
    if (dateMonth > month || (month === 11 && dateMonth === 0)) {
      return '다음달';
    }
    return '이번달';
  };

  const weeks: MonthlyCalendarDate[][] = [];
  let currentWeek: MonthlyCalendarDate[] = [];
  let tempDate = firstDayOfView;

  while (tempDate <= lastDayOfView) {
    currentWeek.push({
      state: getState(tempDate),
      date: tempDate,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    tempDate = addDays(tempDate, 1);
  }

  return weeks;
};

export const generateWeeklyCalendarDates = (displayDate: Date): Date[] => {
  const start = startOfWeek(displayDate);
  return range(7).map((i) => addDays(start, i));
};
