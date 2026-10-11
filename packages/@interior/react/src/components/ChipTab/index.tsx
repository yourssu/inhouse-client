import clsx from 'clsx';
import { assert } from 'es-toolkit';
import { useState } from 'react';

import * as styles from './ChipTab.css';
import { ChipTabPrimitive } from './ChipTabPrimitive';

export { ChipTabPrimitive } from './ChipTabPrimitive';

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
  const [innerTab, setInnerTab] = useState<TTab>(defaultTab ?? tabs[0]);
  const currentTab = tab ?? innerTab;

  const isSafeTabValue = (value: string): value is TTab => {
    return tabs.includes(value as TTab);
  };

  const handleTabChange = (value: string) => {
    assert(isSafeTabValue(value), '잘못된 탭이에요.');
    setInnerTab(value);
    onTabChange?.(value);
  };

  return (
    <>
      <div className={clsx(styles.container, className)}>
        <ChipTabPrimitive onTabChange={handleTabChange} tab={currentTab}>
          {tabs.map((item) => (
            <ChipTabPrimitive.Item key={item} value={item}>
              {item}
            </ChipTabPrimitive.Item>
          ))}
        </ChipTabPrimitive>
        {right}
      </div>
      {children({ tab: currentTab })}
    </>
  );
};
