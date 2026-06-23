import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import clsx from 'clsx';
import { addMonths, setDate } from 'date-fns';
import { assert } from 'es-toolkit';
import { useMemo, useState } from 'react';

import type { DateRange, DateRangePickerProps } from '../types';

import { Button } from '../../Button';
import { Popover } from '../../Popover';
import { CalendarContext } from '../context';
import * as styles from '../DatePicker.css';
import { maximumDate, minimumDate } from '../utils';
import { CalendarPanel } from './CalendarPanel';

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

  const hasNoRangeValue = !controlledValue?.from || !controlledValue?.to;

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
        <Popover.Trigger asChild>
          <button
            className={clsx(styles.trigger({ variant, size }), className)}
            disabled={disabled}
            type="button"
          >
            <div
              className={clsx(styles.triggerRangeContainer, hasNoRangeValue && styles.placeholder)}
            >
              <div className={styles.triggerRangeValue}>
                {controlledValue?.from
                  ? formatTemplates['2026. 01. 01'](controlledValue.from)
                  : '년. 월. 일'}
              </div>
              <span className={styles.triggerRangeSeparator({ disabled })}>~</span>
              <div className={styles.triggerRangeValue}>
                {controlledValue?.to
                  ? formatTemplates['2026. 01. 01'](controlledValue.to)
                  : '년. 월. 일'}
              </div>
            </div>
          </button>
        </Popover.Trigger>
        <Popover.Content
          align="start"
          className={styles.popoverContent}
          onCloseWithOutside={onCancel}
          sideOffset={8}
        >
          <div className={styles.panelContainer}>
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

          <div className={styles.footer}>
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
