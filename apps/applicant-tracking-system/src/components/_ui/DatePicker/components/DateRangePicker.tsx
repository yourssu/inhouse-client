import clsx from 'clsx';
import { addMonths, setDate } from 'date-fns';
import { assert } from 'es-toolkit';
import { useMemo, useState } from 'react';

import type { DateRange, DateRangePickerProps } from '@/components/_ui/DatePicker/types';

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

export const DateRangePicker = ({
  value: controlledValue,
  onChange,
  minDate = minimumDate,
  maxDate = maximumDate,
  disabled,
  size,
  variant,
  className,
}: React.PropsWithChildren<DateRangePickerProps>) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    controlledValue ?? { from: null, to: null },
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [leftDisplayDate, setLeftDisplayDate] = useState<Date>(() =>
    setDate(controlledValue?.from ?? new Date(), 1),
  );
  const rightDisplayDate = useMemo(() => addMonths(leftDisplayDate, 1), [leftDisplayDate]);

  const onDateClick = (date: Date) => {
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      setSelectedRange({ from: date, to: null });
      return;
    }
    const start = selectedRange.from;
    if (date < start) {
      setSelectedRange({ from: date, to: start });
    } else {
      setSelectedRange({ from: start, to: date });
    }
  };

  const onConfirm = () => {
    const { from, to } = selectedRange;
    assert(from && to, '범위가 선택되지 않았어요.');
    onChange?.({ from, to });
  };

  const onReset = () => {
    setSelectedRange({ from: null, to: null });
    setLeftDisplayDate(setDate(new Date(), 1));
  };

  const onCancel = () => {
    setSelectedRange(controlledValue ?? { from: null, to: null });
    setLeftDisplayDate(setDate(controlledValue?.from ?? new Date(), 1));
  };

  return (
    <CalendarContext.Provider
      value={{
        hoverDate,
        mode: 'range',
        rangeEnd: selectedRange.to,
        rangeStart: selectedRange.from,
        selectedDate: null,
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
            <div
              className={clsx(
                'flex items-center',
                (!controlledValue?.from || !controlledValue?.to) && 'text-grey400',
              )}
            >
              <div className="min-w-[124px] px-3.5 text-left">
                {controlledValue?.from
                  ? formatTemplates['2026. 01. 01'](controlledValue.from)
                  : '년. 월. 일'}
              </div>
              <span className="text-greyOpacity400 group-disabled:text-greyOpacity200">~</span>
              <div className="min-w-[124px] px-3.5 text-left">
                {controlledValue?.to
                  ? formatTemplates['2026. 01. 01'](controlledValue.to)
                  : '년. 월. 일'}
              </div>
            </div>
          </button>
        </Popover.Target>
        <Popover.Content
          align="start"
          className="bg-floatBackground shadow-select rounded-xl p-4"
          onCloseWithOutside={onCancel}
          sideOffset={8}
        >
          <div className="flex gap-6">
            <CalendarPanel
              displayDate={leftDisplayDate}
              onChangeDisplayDate={setLeftDisplayDate}
              onDateClick={onDateClick}
              onDateHover={setHoverDate}
              showNavigation={false}
            />
            <CalendarPanel
              displayDate={rightDisplayDate}
              onChangeDisplayDate={(date) => setLeftDisplayDate(addMonths(date, -1))}
              onDateClick={onDateClick}
              onDateHover={setHoverDate}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button onClick={onReset} size="sm" variant="secondary">
              초기화
            </Button>
            <Popover.Closeable asChild>
              <Button
                disabled={!selectedRange.from || !selectedRange.to}
                onClick={onConfirm}
                size="sm"
                variant="primary"
              >
                확인
              </Button>
            </Popover.Closeable>
          </div>
        </Popover.Content>
      </Popover>
    </CalendarContext.Provider>
  );
};
