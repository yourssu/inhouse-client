import { CalendarPanelHeader } from './CalendarPanelHeader';
import { DateGrid } from './DateGrid';
import { DateGridHeader } from './DateGridHeader';

interface CalendarPanelProps {
  displayDate: Date;
  onChangeDisplayDate: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onDateHover?: (date: Date | null) => void;
  showNavigation?: boolean;
}

export const CalendarPanel = ({
  displayDate,
  onChangeDisplayDate,
  onDateClick,
  onDateHover,
  showNavigation = true,
}: CalendarPanelProps) => {
  return (
    <div>
      <CalendarPanelHeader
        displayDate={displayDate}
        onChangeDisplayDate={onChangeDisplayDate}
        showNavigation={showNavigation}
      />
      <DateGridHeader />
      <DateGrid currentDate={displayDate} onDateClick={onDateClick} onDateHover={onDateHover} />
    </div>
  );
};
