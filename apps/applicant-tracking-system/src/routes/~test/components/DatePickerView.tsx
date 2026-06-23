import type { ComponentProps } from 'react';

import { useState } from 'react';

import { DatePicker, DateRangePicker } from '@/components/_ui/DatePicker';

export const DatePickerView = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const sizes: ComponentProps<typeof DatePicker>['size'][] = ['lg', 'md', 'sm', 'xs'];
  const variants: ComponentProps<typeof DatePicker>['variant'][] = ['outline', 'dimmed', 'inline'];

  return (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant}>
          <h3 className="mb-4 text-lg font-bold">Variant: {variant}</h3>
          <div className="flex flex-col gap-4">
            {sizes.map((size) => (
              <div className="flex flex-wrap items-center gap-4" key={size}>
                <div className="w-16 text-sm font-semibold">{size}</div>
                <DatePicker onChange={setDate} size={size} value={date} variant={variant} />
                <DateRangePicker
                  onChange={(value) => {
                    setDateRange([value.from, value.to]);
                  }}
                  size={size}
                  value={{
                    from: dateRange[0],
                    to: dateRange[1],
                  }}
                  variant={variant}
                />
                <DateRangePicker
                  disabled
                  onChange={(value) => {
                    setDateRange([value.from, value.to]);
                  }}
                  size={size}
                  value={{
                    from: dateRange[0],
                    to: dateRange[1],
                  }}
                  variant={variant}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
