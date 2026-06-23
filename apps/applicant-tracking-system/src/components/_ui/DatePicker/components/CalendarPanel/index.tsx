import { CalendarPanelHeader } from '@/components/_ui/DatePicker/components/CalendarPanel/CalendarPanelHeader';
import { DateGrid } from '@/components/_ui/DatePicker/components/CalendarPanel/DateGrid';
import { DateGridHeader } from '@/components/_ui/DatePicker/components/CalendarPanel/DateGridHeader';

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
