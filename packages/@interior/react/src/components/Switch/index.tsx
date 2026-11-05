import clsx from 'clsx';

import * as styles from './Switch.css';

export type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size: 'lg' | 'md' | 'sm' | 'xl';
};

export const Switch = ({
  className,
  checked = false,
  onCheckedChange,
  size,
  ...props
}: SwitchProps) => {
  return (
    <button
      aria-checked={checked}
      className={clsx(styles.base({ checked, size }), className)}
      onClick={() => onCheckedChange?.(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span className={clsx(styles.thumb({ checked, size }))} />
    </button>
  );
};
