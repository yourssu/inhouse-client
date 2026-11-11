import { useEffect, useRef, useState } from 'react';

const enabledTabSelector = '[role="tab"]:not([disabled]):not([aria-disabled="true"])';

export const useTabListA11y = (value: string | undefined, children: React.ReactNode) => {
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

    // 선택된 탭이 없거나 비활성이면 첫 활성 탭을 Tab 키 진입점으로 삼는다.
    // value는 바꾸지 않고, 사용처에서 오류를 가시적으로 확인하도록 한다.
    const firstEnabledTab = list.querySelector<HTMLElement>(enabledTabSelector);
    setFallbackTabId(firstEnabledTab?.id);
  }, [children, value]);

  useEffect(() => {
    const list = listRef.current;
    if (process.env.NODE_ENV === 'production' || list == null) {
      return;
    }

    const hasTab = list.querySelector('[role="tab"]') !== null;
    const hasSelectedTab = list.querySelector('[role="tab"][aria-selected="true"]') !== null;
    if (hasTab && !hasSelectedTab) {
      console.error(`Tab: value "${value}"와 일치하는 Tab.Item이 없어요.`);
    }
  }, [value]);

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

  return { fallbackTabId, handleKeyDown, listRef };
};

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
