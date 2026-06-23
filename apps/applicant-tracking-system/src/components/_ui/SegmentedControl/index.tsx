import clsx from 'clsx';
import { motion } from 'motion/react';
import { useId } from 'react';

import { cn } from '@/utils/tw';

interface SegmentedControlProps<T> {
  className?: string;
  id?: string;
  items: T[];
  onValueChange: (value: T) => void;
  value: T;
}

export const SegmentedControl = <T extends string>({
  value,
  onValueChange,
  items,
  className,
  id: outerId,
}: SegmentedControlProps<T>) => {
  const internalId = useId();
  const id = outerId ?? internalId;

  return (
    <div
      aria-orientation="horizontal"
      className={cn('bg-greyOpacity100 flex h-8 w-auto items-center rounded-lg p-0.5', className)}
      role="radiogroup"
    >
      {items.map((item) => {
        const isSelected = value === item;
        return (
          <button
            aria-checked={isSelected}
            className="relative inline-flex h-full min-w-7 flex-[1_0] cursor-pointer items-center justify-center rounded-md px-1.5 text-sm font-medium transition-colors"
            key={item}
            onClick={() => onValueChange(item)}
            role="radio"
            type="button"
          >
            {isSelected && (
              <motion.div
                className="bg-backgroundLevel04 shadow-segmented-control-indicator absolute inset-0 top-0 left-0 z-0 rounded-lg"
                layoutId={`segment-indicator-${id}`}
              />
            )}
            <span
              className={clsx(
                'ease-ease relative z-10 shrink-0 px-1 transition-colors duration-200',
                isSelected ? 'text-greyOpacity800' : 'text-greyOpacity600',
              )}
            >
              {item}
            </span>
          </button>
        );
      })}
    </div>
  );
};
