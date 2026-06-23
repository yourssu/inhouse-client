import { Children, Fragment } from 'react';

import { SelectionBarActionButton } from '@/routes/~_auth/~recruit/~applicants/components/SelectionBar/ActionButton';
import { cn, tv } from '@/utils/tw';

interface SelectionBarProps {
  children?: React.ReactNode;
  count: number;
}

const selectionBar = tv({
  slots: {
    position: 'text-neutralMuted fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
    container:
      'bg-lightBackground shadow-select flex items-center gap-1 rounded-full px-6 py-1.5 pr-3',
    countSection: 'text-15 mr-2 flex items-center gap-1 font-medium',
    countNumber: 'text-violet500 font-semibold',
    divider: 'bg-greyOpacity200 mx-1 h-4 w-px',
  },
});

export const SelectionBar = ({ count, children }: SelectionBarProps) => {
  const { position, container, countSection, countNumber } = selectionBar();
  return (
    <div className={cn(position())}>
      <div className={cn(container())}>
        <div className={countSection()}>
          <span>선택</span>
          <span className={countNumber()}>{count}</span>
        </div>
        {Children.map(children, (child, i) => (
          <Fragment key={i}>
            <span className="text-greyOpacity300">|</span>
            {child}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

SelectionBar.ActionButton = SelectionBarActionButton;
