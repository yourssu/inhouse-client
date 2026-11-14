import { useEffect, useRef, useState } from 'react';

const tabSelector = '[role="tab"]';
const enabledTabSelector = `${tabSelector}:not([disabled]):not([aria-disabled="true"])`;
const selectedSelector = '[aria-selected="true"]';

const hasTab = (list: HTMLElement) => list.querySelector(tabSelector) !== null;
const hasSelectedTab = (list: HTMLElement) =>
  list.querySelector(`${tabSelector}${selectedSelector}`) !== null;
const hasSelectedAndEnabledTab = (list: HTMLElement) =>
  list.querySelector(`${enabledTabSelector}${selectedSelector}`) !== null;
const findFirstEnabledTab = (list: HTMLElement) =>
  list.querySelector<HTMLElement>(enabledTabSelector);
const findEnabledTabs = (list: HTMLElement) => [
  ...list.querySelectorAll<HTMLElement>(enabledTabSelector),
];

export const useTabListA11y = (value: string | undefined, children: React.ReactNode) => {
  const listRef = useRef<HTMLDivElement>(null);
  // 평소엔 선택된 탭이 진입점이고, 선택된 active 탭이 없을 때만 이 id의 탭이 대신한다.
  const [fallbackTabId, setFallbackTabId] = useState<string>();

  useEffect(() => {
    const list = listRef.current;
    if (list == null) {
      return;
    }

    // 선택된 탭이 없거나 비활성이면 첫 active 탭을 Tab 키 진입점으로 삼는다.
    setFallbackTabId(hasSelectedAndEnabledTab(list) ? undefined : findFirstEnabledTab(list)?.id);
  }, [children, value]);

  useEffect(() => {
    const list = listRef.current;
    if (process.env.NODE_ENV === 'production' || list == null) {
      return;
    }

    if (hasTab(list) && !hasSelectedTab(list)) {
      console.error(`Tab: value "${value}"와 일치하는 Tab.Item이 없어요.`);
    }
  }, [value]);

  // APG automatic activation: 화살표·Home·End로 포커스를 옮기면 바로 선택한다.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const tabs = findEnabledTabs(event.currentTarget);
    const index = tabs.findIndex((tab) => tab === event.target);
    if (index === -1) {
      return;
    }

    const nextIndex = getNextIndexOnKeyDown(event.key, index, tabs.length);
    if (nextIndex === null) {
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
