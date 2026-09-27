import clsx from 'clsx';
import { forwardRef } from 'react';

import * as styles from './TabButton.css';

export interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  size: 'lg' | 'md';
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ active, size, left, right, children, className, ...props }, ref) => {
    return (
      <button
        className={clsx(styles.container({ active, size }), className)}
        ref={ref}
        type="button"
        {...props}
      >
        {left && <div className={styles.iconWrapper}>{left}</div>}
        <span className={styles.label}>{children}</span>
        {right && <div className={styles.iconWrapper}>{right}</div>}
      </button>
    );
  },
);

TabButton.displayName = 'TabButton';
