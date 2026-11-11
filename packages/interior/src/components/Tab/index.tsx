import { Slot } from '@radix-ui/react-slot';
import { assert } from 'es-toolkit';
import { useId, useState } from 'react';

import { TabContext, TabListContext, useTabContext, useTabListContext } from './context';
import * as styles from './Tab.css';
import { useTabListA11y } from './useTabListA11y';

export { Tab as LegacyTab } from './LegacyTab';

interface TabRootProps {
  asChild?: boolean;
  children?: React.ReactNode;
  /** `value`와 함께 쓸 수 없고, 둘 중 하나는 꼭 넘겨야 해요. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `defaultValue`와 함께 쓸 수 없고, 둘 중 하나는 꼭 넘겨야 해요. */
  value?: string;
}

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
  if (process.env.NODE_ENV !== 'production') {
    assert(
      xor(value != null, defaultValue != null),
      'Tab.Root는 value와 defaultValue 중 하나만 사용해야해요.',
    );
  }

  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const isControlled = value !== undefined;
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
  const { value } = useTabContext();
  const { fallbackTabId, handleKeyDown, listRef } = useTabListA11y(value, children);

  const Comp = asChild ? Slot : 'div';

  return (
    <TabListContext.Provider value={{ fallbackTabId }}>
      <Comp aria-label={ariaLabel} onKeyDown={handleKeyDown} ref={listRef} role="tablist">
        {children}
      </Comp>
    </TabListContext.Provider>
  );
};

const Item = ({ asChild, children, disabled, value }: TabItemProps) => {
  const { baseId, onValueChange, value: selectedValue } = useTabContext();
  const { fallbackTabId } = useTabListContext();

  const selected = value === selectedValue;
  const tabId = getTabId(baseId, value);

  const handleClick = () => {
    // Transition의 Pending 처리는 Tab이 하지 않고, 사용처가 value로 최신 요청을 넘기는 것으로 위임한다 (#238).
    if (disabled || selected) {
      return;
    }
    onValueChange(value);
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // 비활성 Panel은 마운트되지 않을 수 있어 존재하지 않는 id를 가리키지 않도록 선택된 탭만 연결한다.
      aria-controls={selected ? getPanelId(baseId, value) : undefined}
      aria-disabled={disabled}
      aria-selected={selected}
      disabled={disabled}
      id={tabId}
      onClick={handleClick}
      role="tab"
      tabIndex={selected || tabId === fallbackTabId ? 0 : -1}
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

const xor = (a: boolean, b: boolean) => {
  return a !== b;
};
