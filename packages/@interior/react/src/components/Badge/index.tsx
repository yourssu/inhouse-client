import clsx from 'clsx';

import * as styles from './Badge.css';

interface BadgeProps {
  className?: string;
  color: 'blue' | 'green' | 'grey' | 'red' | 'violet' | 'yellow';
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs';
}

export const Badge = ({
  children,
  className,
  color,
  size,
}: React.PropsWithChildren<BadgeProps>) => {
  return <div className={clsx(styles.badge({ color, size }), className)}>{children}</div>;
};
