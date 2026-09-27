import clsx from 'clsx';

import { root } from './Divider.css';

export const Divider = ({ className }: { className?: string }) => {
  return <div className={clsx(root, className)} />;
};
