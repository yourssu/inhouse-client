import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { startTransition, useId, useState } from 'react';

import { cn } from '@/utils/tw';

interface TabProps<TTab extends string> {
  children: (p: { tab: TTab }) => React.ReactNode;
  className?: string;
  defaultTab?: TTab;
  onTabChange?: (value: TTab) => void;
  right?: React.ReactNode;
  tabs: TTab[];
  value?: TTab;
}

export const Tab = <TTab extends string>({
  defaultTab,
  value,
  onTabChange,
  tabs,
  children,
  right,
  className,
}: TabProps<TTab>) => {
  const id = useId();
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]);
  const tab = value !== undefined ? value : internalTab;

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <div className="flex items-center justify-between">
        <LayoutGroup id={id}>
          <div className="flex grow flex-wrap gap-x-5" role="tablist">
            {tabs.map((item) => (
              <button
                aria-selected={item === tab}
                className="relative w-fit cursor-pointer py-2.5"
                key={item}
                onClick={() => {
                  startTransition(() => {
                    if (value === undefined) {
                      setInternalTab(item);
                    }
                    onTabChange?.(item);
                  });
                }}
                role="tab"
              >
                <span
                  className={clsx(
                    'text-grey800 text-15',
                    item === tab ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {item}
                </span>
                {item === tab && (
                  <motion.div
                    className="bg-grey800 absolute bottom-0 h-0.5 w-full"
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>
        {right}
      </div>
      {children({ tab })}
    </div>
  );
};
