import { isBefore } from 'date-fns';

export const weekDaysKo = ['일', '월', '화', '수', '목', '금', '토'];
export const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const isInRange = (date: Date, start: Date, end: Date): boolean => {
  return isBefore(start, date) && isBefore(date, end);
};

export const getCalendarDays = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  // 첫 주 이전 빈 칸
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  // 월의 모든 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
};

export const minimumDate = new Date(-8640000000000000);
export const maximumDate = new Date(8640000000000000);
