import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { startTransition, useId, useState } from 'react';

import { cn } from '@/utils/tw';

interface ChipTabProps<TTab extends string> {
  children: (p: { tab: TTab }) => React.ReactNode;
  className?: string;
  defaultTab?: TTab;
  onTabChange?: (value: TTab) => void;
  right?: React.ReactNode;
  tab?: TTab;
  tabs: TTab[];
}

export const ChipTab = <TTab extends string>({
  tab,
  defaultTab,
  onTabChange,
  tabs,
  children,
  right,
  className,
}: ChipTabProps<TTab>) => {
  const id = useId();
  const [innerTab, setInnerTab] = useState<TTab>(defaultTab ?? tabs[0]);

  const currentTab = tab ?? innerTab;

  const handleTabChange = (value: TTab) => {
    startTransition(() => {
      setInnerTab(value);
      onTabChange?.(value);
    });
  };

  return (
    <>
      <div className={cn('flex w-full items-center', className)}>
        <LayoutGroup id={id}>
          <div className="flex flex-wrap">
            {tabs.map((item) => {
              const selected = currentTab === item;
              return (
                <button
                  className={clsx(
                    'text-15 relative h-9.5 cursor-pointer rounded-full px-4',
                    selected ? 'text-greyOpacity800 font-semibold' : 'text-greyOpacity600',
                  )}
                  key={item}
                  onClick={() => handleTabChange(item)}
                >
                  {selected && (
                    <motion.div
                      className="bg-greyOpacity100 absolute top-0 left-0 size-full rounded-full"
                      layoutId="chip-tab-indicator"
                    />
                  )}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        {right}
      </div>
      {children({ tab: currentTab })}
    </>
  );
};
