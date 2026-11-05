import clsx from 'clsx';

import * as styles from './Table.css';

type RowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  hoverable?: boolean;
  onClick?: () => void;
  ref?: React.Ref<HTMLTableRowElement>;
};

export const Row = ({
  children,
  className,
  hoverable = false,
  onClick,
  onKeyDown,
  ...props
}: RowProps) => {
  const hoverableAttributes = {
    'data-focus-visible': true,
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(e);
      if (e.key === 'Enter' || e.key === ' ') {
        onClick?.();
      }
    },
  };

  return (
    <tr
      className={clsx(styles.rowRecipe({ hoverable }), className)}
      onClick={onClick}
      {...(hoverable && hoverableAttributes)}
      {...props}
    >
      {children}
    </tr>
  );
};
