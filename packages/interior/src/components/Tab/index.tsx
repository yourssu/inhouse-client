import { Slot, Slottable } from '@radix-ui/react-slot';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { startTransition, useEffect, useId, useRef, useState } from 'react';

import {
  getPanelId,
  getTabId,
  TabContext,
  TabListContext,
  useTabContext,
  useTabListContext,
} from './context';
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
  redBean?: boolean;
  value: string;
}

interface TabPanelProps {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
  value: string;
}

const Root = ({ asChild, children, defaultValue, onValueChange, value }: TabRootProps) => {
  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : innerValue;

  const handleValueChange = (nextValue: string) => {
    if (nextValue === selectedValue) {
      return;
    }

    startTransition(() => {
      if (!isControlled) {
        setInnerValue(nextValue);
      }
      onValueChange?.(nextValue);
    });
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <TabContext.Provider
      value={{ baseId, isControlled, onValueChange: handleValueChange, value: selectedValue }}
    >
      <Comp>{children}</Comp>
    </TabContext.Provider>
  );
};

const enabledTabSelector = '[role="tab"]:not([disabled]):not([aria-disabled="true"])';

const List = ({ 'aria-label': ariaLabel, asChild, children }: TabListProps) => {
  const { isControlled, value } = useTabContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [fallbackTabId, setFallbackTabId] = useState<string>();

  useEffect(() => {
    const list = listRef.current;
    if (list == null) {
      return;
    }

    const hasFocusableSelectedTab =
      list.querySelector(`${enabledTabSelector}[aria-selected="true"]`) !== null;
    if (hasFocusableSelectedTab) {
      setFallbackTabId(undefined);
      return;
    }

    // 선택된 탭이 없거나 비활성이면 첫 번째 활성 탭을 Tab 키 진입점으로 삼는다.
    const firstEnabledTab = list.querySelector<HTMLElement>(enabledTabSelector);
    setFallbackTabId(firstEnabledTab?.id);

    // controlled는 사용처의 값을 존중해 진입점만 옮기고,
    // uncontrolled는 선택도 옮기고 onValueChange로 알린다.
    if (!isControlled) {
      firstEnabledTab?.click();
    }
  }, [children, isControlled, value]);

  // APG automatic activation: 화살표·Home·End로 포커스를 옮기면 바로 선택한다.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const tabs = [...event.currentTarget.querySelectorAll<HTMLElement>(enabledTabSelector)];
    const index = tabs.findIndex((tab) => tab === event.target);
    const nextIndex = getNextIndexOnKeyDown(event.key, index, tabs.length);

    if (index === -1 || nextIndex === null) {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <TabListContext.Provider value={{ fallbackTabId }}>
      <Comp aria-label={ariaLabel} onKeyDown={handleKeyDown} ref={listRef} role="tablist">
        {children}
      </Comp>
    </TabListContext.Provider>
  );
};

const Item = ({ asChild, children, disabled, redBean, value }: TabItemProps) => {
  const { baseId, onValueChange, value: selectedValue } = useTabContext();
  const { fallbackTabId } = useTabListContext();

  const selected = value === selectedValue;
  const tabId = getTabId(baseId, value);
  const isTabStop = selected || tabId === fallbackTabId;

  const handleClick = () => {
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
      tabIndex={isTabStop ? 0 : -1}
      type={asChild ? undefined : 'button'}
    >
      <Slottable>{children}</Slottable>
      {redBean && <VisuallyHidden>새 정보</VisuallyHidden>}
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

// 가로 목록은 ↑↓를 처리하지 않는다 (APG: 브라우저 스크롤에 양보).
const getNextIndexOnKeyDown = (key: string, index: number, length: number) => {
  switch (key) {
    case 'ArrowLeft':
      return (index - 1 + length) % length;
    case 'ArrowRight':
      return (index + 1) % length;
    case 'End':
      return length - 1;
    case 'Home':
      return 0;
    default:
      return null;
  }
};
