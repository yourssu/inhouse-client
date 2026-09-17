import clsx from 'clsx';

import { root } from './VerticalDivider.css';

export const VerticalDivider = ({ className }: { className?: string }) => {
  return <div className={clsx(root, className)} />;
};
