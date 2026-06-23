import clsx from 'clsx';
import { motion } from 'motion/react';
import { useId } from 'react';

import * as styles from './SegmentedControl.css';

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
    <div aria-orientation="horizontal" className={clsx(styles.root, className)} role="radiogroup">
      {items.map((item) => {
        const isSelected = value === item;
        return (
          <button
            aria-checked={isSelected}
            className={styles.button}
            key={item}
            onClick={() => onValueChange(item)}
            role="radio"
            type="button"
          >
            {isSelected && (
              <motion.div className={styles.indicator} layoutId={`segment-indicator-${id}`} />
            )}
            <span
              className={clsx(
                styles.label,
                isSelected ? styles.labelSelected : styles.labelUnselected,
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
