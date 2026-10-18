import type { MouseEventHandler, ReactNode } from 'react';

import clsx from 'clsx';

interface CommentThreadCardProps {
  children: ReactNode;
  isSelected: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const CommentThreadCard = ({ children, isSelected, onClick }: CommentThreadCardProps) => (
  <div
    className={clsx(
      'rounded-8 hover:bg-grey50 relative left-0 z-10 flex flex-col gap-3 border p-4 transition-[left] hover:-left-1',
      isSelected ? 'border-violet300' : 'border-grey200',
    )}
    onClick={onClick}
  >
    {children}
  </div>
);
