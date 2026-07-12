import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { addMonths, addWeeks, endOfWeek, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface DateIndicatorProps {
  disableNext?: boolean;
  disablePrevious?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  title: React.ReactNode;
  titleClassName?: string;
}

const DateIndicator = ({
  title,
  onNext,
  onPrevious,
  disableNext,
  disablePrevious,
  titleClassName,
}: DateIndicatorProps) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        <IconButton disabled={disablePrevious} onClick={onPrevious} size="xxs" variant="dimmed">
          <MdChevronLeft className="size-5" />
        </IconButton>
        <div className={cn('min-w-50 text-center text-xl font-semibold', titleClassName)}>
          {title}
        </div>
        <IconButton disabled={disableNext} onClick={onNext} size="xxs" variant="dimmed">
          <MdChevronRight className="size-5" />
        </IconButton>
      </div>
    </div>
  );
};

export const WeeklyIndicator = ({
  date,
  onDateChange,
  disableNext,
  disablePrevious,
}: {
  date: Date;
  disableNext?: boolean;
  disablePrevious?: boolean;
  onDateChange: (date: Date) => void;
}) => {
  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  const startLabel = formatTemplates['1월 1일'](startDate);
  const endLabel = formatTemplates['1월 1일'](endDate);

  const handlePreviousWeek = () => {
    onDateChange(subWeeks(date, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(date, 1));
  };

  return (
    <DateIndicator
      disableNext={disableNext}
      disablePrevious={disablePrevious}
      onNext={handleNextWeek}
      onPrevious={handlePreviousWeek}
      title={`${startLabel} ~ ${endLabel}`}
    />
  );
};

export const MonthlyIndicator = ({
  date,
  onDateChange,
  disableNext,
  disablePrevious,
}: {
  date: Date;
  disableNext?: boolean;
  disablePrevious?: boolean;
  onDateChange: (date: Date) => void;
}) => {
  const handlePreviousMonth = () => {
    onDateChange(subMonths(date, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(date, 1));
  };

  return (
    <DateIndicator
      disableNext={disableNext}
      disablePrevious={disablePrevious}
      onNext={handleNextMonth}
      onPrevious={handlePreviousMonth}
      title={formatTemplates['2026년 1월'](date)}
      titleClassName="min-w-[160px]"
    />
  );
};
