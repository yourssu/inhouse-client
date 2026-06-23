import clsx from 'clsx';
import { setDate } from 'date-fns';
import { assert } from 'es-toolkit';
import { useCallback, useState } from 'react';

import type { DatePickerProps } from '@/components/_ui/DatePicker/types';

import { Button } from '@/components/_ui/Button';
import { CalendarPanel } from '@/components/_ui/DatePicker/components/CalendarPanel';
import { CalendarContext } from '@/components/_ui/DatePicker/context';
import { maximumDate, minimumDate } from '@/components/_ui/DatePicker/utils';
import { Popover } from '@/components/_ui/Popover';
import { formatTemplates } from '@/utils/date';
import { cn, tv } from '@/utils/tw';

const trigger = tv({
  base: 'group ease-ease text-greyOpacity800 disabled:text-greyOpacity300 flex cursor-pointer items-center justify-between rounded-lg py-2 transition-colors duration-200 disabled:cursor-not-allowed',
  variants: {
    variant: {
      outline: 'shadow-select-outline enabled:hover:shadow-select-outline-hover transition-shadow',
      dimmed: 'enabled:hover:bg-greyOpacity200 bg-greyOpacity100',
      inline: 'enabled:hover:bg-buttonTransparentBackgroundHovered',
    },
    size: {
      xs: 'text-13 h-6',
      sm: 'text-13 h-7',
      md: 'h-8 text-sm',
      lg: 'text-15 h-9.5',
    },
  },
});

export const DatePicker = ({
  value: controlledDate,
  onChange,
  minDate = minimumDate,
  maxDate = maximumDate,
  disabled,
  size,
  variant,
  className,
}: React.PropsWithChildren<DatePickerProps>) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(controlledDate ?? null);
  const [displayDate, setDisplayDate] = useState<Date>(() =>
    setDate(controlledDate ?? new Date(), 1),
  );

  const onDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const onConfirm = useCallback(() => {
    assert(!!selectedDate, '날짜가 선택되지 않았어요.');
    onChange?.(selectedDate);
  }, [selectedDate, onChange]);

  const onReset = useCallback(() => {
    setSelectedDate(null);
    setDisplayDate(setDate(new Date(), 1));
  }, []);

  const onCancel = () => {
    setSelectedDate(controlledDate ?? null);
    setDisplayDate(setDate(controlledDate ?? new Date(), 1));
  };

  return (
    <CalendarContext
      value={{
        hoverDate: null,
        mode: 'single',
        rangeEnd: null,
        rangeStart: null,
        selectedDate,
        maxDate,
        minDate,
      }}
    >
      <Popover>
        <Popover.Target asChild>
          <button
            className={cn(trigger({ variant, size }), className)}
            disabled={disabled}
            type="button"
          >
            <div className={clsx(!controlledDate && 'text-grey400')}>
              <span className="px-3.5">
                {controlledDate ? formatTemplates['2026. 01. 01'](controlledDate) : '년. 월. 일'}
              </span>
            </div>
          </button>
        </Popover.Target>
        <Popover.Content
          align="start"
          className="bg-floatBackground shadow-select rounded-xl p-4"
          onCloseWithOutside={onCancel}
          sideOffset={8}
        >
          <CalendarPanel
            displayDate={displayDate}
            onChangeDisplayDate={setDisplayDate}
            onDateClick={onDateClick}
          />

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button onClick={onReset} size="sm" variant="secondary">
              초기화
            </Button>
            <Popover.Closeable asChild>
              <Button disabled={!selectedDate} onClick={onConfirm} size="sm" variant="primary">
                확인
              </Button>
            </Popover.Closeable>
          </div>
        </Popover.Content>
      </Popover>
    </CalendarContext>
  );
};
