import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

export interface TabSectionContextType {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export const TabSectionContext = createContext<null | TabSectionContextType>(null);

export const useTabSectionContext = () => {
  const context = useContext(TabSectionContext);
  assert(!!context, 'useTabSectionContext는 TabSectionContext.Provider 하위에서 사용해야해요.');
  return context;
};
