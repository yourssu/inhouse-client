import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface TabContextType {
  baseId: string;
  isControlled: boolean;
  onValueChange: (value: string) => void;
  value: string | undefined;
}

export const TabContext = createContext<null | TabContextType>(null);

export const useTabContext = () => {
  const context = useContext(TabContext);
  assert(context !== null, 'useTabContext는 Tab.Root 하위에서 사용해야해요.');
  return context;
};

interface TabListContextType {
  fallbackTabId: string | undefined;
}

export const TabListContext = createContext<null | TabListContextType>(null);

export const useTabListContext = () => {
  const context = useContext(TabListContext);
  assert(context !== null, 'useTabListContext는 Tab.List 하위에서 사용해야해요.');
  return context;
};

// aria-controls는 공백으로 구분된 id 목록이라 value의 공백을 인코딩한다.
export const getTabId = (baseId: string, value: string) =>
  `${baseId}-tab-${encodeURIComponent(value)}`;

export const getPanelId = (baseId: string, value: string) =>
  `${baseId}-panel-${encodeURIComponent(value)}`;
