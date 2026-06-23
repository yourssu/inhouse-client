import clsx from 'clsx';
import { isSameMonth, isSameYear } from 'date-fns';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Popover } from '@/components/_ui/Popover';
import { formatTemplates } from '@/utils/date';

interface DateSelectProps {
  currentDate: Date;
  dates: Date[];
  onChange: (date: Date) => void;
}

export const DateSelect = ({ dates, onChange, currentDate }: DateSelectProps) => {
  return (
    <Popover>
      <Popover.Target>
        <button
          className="hover:bg-greyOpacity100 flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-base font-semibold transition-colors"
          type="button"
        >
          {formatTemplates['2026. 1.'](currentDate)}
          <MdKeyboardArrowDown className="text-grey500 h-4 w-4 transition-transform" />
        </button>
      </Popover.Target>
      <Popover.Content
        align="start"
        className="bg-floatBackground shadow-select max-h-60 overflow-y-auto rounded-lg"
        sideOffset={4}
      >
        <div className="py-2">
          {dates.map((v) => (
            <Popover.Closeable asChild key={v.toISOString()}>
              <button
                className={clsx(
                  'hover:bg-greyOpacity100 block w-full cursor-pointer px-4 py-1.5 text-left text-sm transition-colors',
                  isSameYear(v, currentDate) &&
                    isSameMonth(v, currentDate) &&
                    'text-violet500 font-medium',
                )}
                onClick={() => onChange(v)}
                type="button"
              >
                {formatTemplates['2026년 1월'](v)}
              </button>
            </Popover.Closeable>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
