import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { startTransition, useId, useState } from 'react';

import * as styles from './ChipTab.css';
import { ChipTabPrimitiveContext, useChipTabPrimitiveContext } from './context';

interface ChipTabPrimitiveItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const ChipTabPrimitiveItem = ({ children, value, className }: ChipTabPrimitiveItemProps) => {
  const { activeTab, onTabChange } = useChipTabPrimitiveContext();
  const selected = activeTab === value;

  return (
    <button
      aria-selected={selected}
      className={clsx(styles.item({ selected }), className)}
      onClick={() => onTabChange(value)}
      role="tab"
      type="button"
    >
      {selected && <motion.div className={styles.indicator} layoutId="chip-tab-indicator" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
};

interface ChipTabPrimitiveProps {
  children?: React.ReactNode;
  className?: string;
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  tab?: string;
}

export const ChipTabPrimitive = ({
  children,
  className,
  defaultTab,
  onTabChange,
  tab,
}: ChipTabPrimitiveProps) => {
  const id = useId();
  const [innerTab, setInnerTab] = useState<string>(defaultTab ?? '');
  const activeTab = tab ?? innerTab;

  const handleTabChange = (value: string) => {
    startTransition(() => {
      if (tab === undefined) {
        setInnerTab(value);
      }
      onTabChange?.(value);
    });
  };

  return (
    <ChipTabPrimitiveContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <LayoutGroup id={id}>
        <div className={clsx(styles.list, className)} role="tablist">
          {children}
        </div>
      </LayoutGroup>
    </ChipTabPrimitiveContext.Provider>
  );
};

ChipTabPrimitive.Item = ChipTabPrimitiveItem;
