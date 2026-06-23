import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { startTransition, useId, useState } from 'react';

import * as styles from './Tab.css';

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
    <div className={clsx(styles.root, className)}>
      <div className={styles.header}>
        <LayoutGroup id={id}>
          <div className={styles.list} role="tablist">
            {tabs.map((item) => {
              const selected = item === tab;
              return (
                <button
                  aria-selected={selected}
                  className={styles.button}
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
                  <span className={clsx(styles.label({ selected }))}>{item}</span>
                  {selected && (
                    <motion.div
                      className={styles.indicator}
                      layoutId="tab-indicator"
                      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        {right}
      </div>
      {children({ tab })}
    </div>
  );
};
