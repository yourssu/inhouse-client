import { Slot } from '@radix-ui/react-slot';
import { assert } from 'es-toolkit';
import { useId, useState } from 'react';

import { TabContext, useTabContext } from './context';
import * as styles from './Tab.css';

export { Tab as LegacyTab } from './LegacyTab';

type TabRootValueProps =
  { defaultValue: string; value?: never } | { defaultValue?: never; value: string };

type TabRootProps = TabRootValueProps & {
  asChild?: boolean;
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
};

interface TabListProps extends Pick<React.AriaAttributes, 'aria-label'> {
  asChild?: boolean;
  children?: React.ReactNode;
  /** @default 'hug' */
  layout?: 'fill' | 'hug';
  /** @default 'large' */
  size?: 'large' | 'small';
}

interface TabItemProps {
  asChild?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  value: string;
}

interface TabPanelProps {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
  value: string;
}

const Root = ({ asChild, children, defaultValue, onValueChange, value }: TabRootProps) => {
  const isControlled = value !== undefined;
  const isUncontrolled = defaultValue !== undefined
  const hasOnlyOneOfValueAndDefaultValue = isControlled !== isUncontrolled;

  assert(
    hasOnlyOneOfValueAndDefaultValue,
    'Tab.Root는 value와 defaultValue 중 하나만 사용해야해요.',
  );

  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = isControlled ? value : innerValue;

  const handleValueChange = (nextValue: string) => {
    if (!isControlled) {
      setInnerValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <TabContext.Provider value={{ baseId, onValueChange: handleValueChange, value: selectedValue }}>
      <Comp>{children}</Comp>
    </TabContext.Provider>
  );
};

const List = ({ 'aria-label': ariaLabel, asChild, children }: TabListProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp aria-label={ariaLabel} role="tablist">
      {children}
    </Comp>
  );
};

const Item = ({ asChild, children, disabled, value }: TabItemProps) => {
  const { baseId, onValueChange, value: selectedValue } = useTabContext();
  const isSelected = value === selectedValue;
  const tabId = getTabId(baseId, value);

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onValueChange(value);
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      aria-controls={getPanelId(baseId, value)}
      aria-disabled={disabled}
      aria-selected={isSelected}
      disabled={disabled}
      id={tabId}
      onClick={handleClick}
      role="tab"
      tabIndex={isSelected ? 0 : -1}
      type={asChild ? undefined : 'button'}
    >
      {children}
    </Comp>
  );
};

const Panel = ({ asChild, children, forceMount = false, value }: TabPanelProps) => {
  const { baseId, value: selectedValue } = useTabContext();
  const isSelected = value === selectedValue;

  if (!isSelected && !forceMount) {
    return null;
  }

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      aria-labelledby={getTabId(baseId, value)}
      className={styles.panel}
      hidden={!isSelected}
      id={getPanelId(baseId, value)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </Comp>
  );
};

export const Tab = { Item, List, Panel, Root };

// aria-controls는 공백으로 구분된 id 목록이라 value의 공백을 인코딩한다.
const getTabId = (baseId: string, value: string) => `${baseId}-tab-${encodeURIComponent(value)}`;

const getPanelId = (baseId: string, value: string) =>
  `${baseId}-panel-${encodeURIComponent(value)}`;
