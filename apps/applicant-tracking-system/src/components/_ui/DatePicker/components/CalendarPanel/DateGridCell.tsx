import clsx from 'clsx';
import { isToday } from 'date-fns';

import { useDateStatus } from '@/components/_ui/DatePicker/hooks/useDateStatus';
import { tv } from '@/utils/tw';

interface DateGridCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date;
}

const cell = tv({
  base: 'text-13 group-disabled:text-grey300 group-hover:bg-greyOpacity100 flex size-full items-center justify-center rounded-full group-disabled:cursor-not-allowed',
  variants: {
    status: {
      default: '',
      disabled: '',
      range: 'bg-greyOpacity100 group-hover:bg-greyOpacity100 text-neutralMuted rounded-none',
      selected: 'bg-violet500 group-hover:bg-violet600! relative z-10 text-white',
      future: 'text-grey400',
    },
  },
});

export const DateGridCell = ({ date, ...props }: DateGridCellProps) => {
  const { status, type } = useDateStatus(date);

  const isRangeStart = status === 'selected' && type === 'start';
  const isRangeEnd = status === 'selected' && type === 'end';

  return (
    <div className="flex h-9 w-8 items-center justify-center" key={date.toISOString()}>
      <button
        className="group relative size-full cursor-pointer py-0.5"
        disabled={status === 'disabled'}
        type="button"
        {...props}
      >
        {isRangeStart && (
          <div className="bg-greyOpacity100 absolute top-0.5 right-0 bottom-0.5 z-0 w-1/2" />
        )}
        {isRangeEnd && (
          <div className="bg-greyOpacity100 absolute top-0.5 bottom-0.5 left-0 z-0 w-1/2" />
        )}
        {isToday(date) && (
          <span
            className={clsx(
              'absolute top-1 left-1/2 z-20 h-1 w-1 -translate-x-1/2 rounded-full',
              status === 'selected' ? 'bg-white' : 'bg-violet600',
            )}
          />
        )}
        <div className={cell({ status })}>{date.getDate()}</div>
      </button>
    </div>
  );
};
