import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import clsx from 'clsx';
import { setDate } from 'date-fns';
import { assert } from 'es-toolkit';
import { useCallback, useState } from 'react';

import type { DatePickerProps } from '@/components/DatePicker/types';

import { Button } from '@/components/Button';
import { CalendarContext } from '@/components/DatePicker/context';
import * as styles from '@/components/DatePicker/DatePicker.css';
import { maximumDate, minimumDate } from '@/components/DatePicker/utils';
import { Popover } from '@/components/Popover';

import { CalendarPanel } from './CalendarPanel';

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
        <Popover.Trigger asChild>
          <button
            className={clsx(styles.trigger({ variant, size }), className)}
            disabled={disabled}
            type="button"
          >
            <div className={clsx(!controlledDate && styles.placeholder)}>
              <span className={styles.triggerSpan}>
                {controlledDate ? formatTemplates['2026. 01. 01'](controlledDate) : '년. 월. 일'}
              </span>
            </div>
          </button>
        </Popover.Trigger>
        <Popover.Content
          align="start"
          className={styles.popoverContent}
          onCloseWithOutside={onCancel}
          sideOffset={8}
        >
          <CalendarPanel
            displayDate={displayDate}
            onChangeDisplayDate={setDisplayDate}
            onDateClick={onDateClick}
          />

          <div className={styles.footer}>
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
