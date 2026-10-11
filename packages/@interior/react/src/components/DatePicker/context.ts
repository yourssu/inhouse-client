import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface CalendarContextProps {
  hoverDate: Date | null;
  maxDate: Date;
  minDate: Date;
  mode: 'range' | 'single';
  rangeEnd: Date | null;
  rangeStart: Date | null;
  selectedDate: Date | null;
}

export const CalendarContext = createContext<CalendarContextProps | null>(null);

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  assert(!!context, 'useCalendarContext는 CalendarContextProvider 하위에서 사용해야 해요.');
  return context;
};
