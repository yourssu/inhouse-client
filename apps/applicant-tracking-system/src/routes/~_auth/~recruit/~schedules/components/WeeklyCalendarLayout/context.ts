import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface WeeklyCalendarLayoutContextType {
  displayDates: Date[];
}

export const WeeklyCalendarLayoutContext = createContext<null | WeeklyCalendarLayoutContextType>(
  null,
);

export const useWeeklyCalendarLayoutContext = () => {
  const context = useContext(WeeklyCalendarLayoutContext);
  assert(!!context, 'useWeeklyCalendarLayoutContext는 WeeklyCalendarLayout 하위에서 사용해야해요.');
  return context;
};
