import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface TabContextType {
  baseId: string;
  onValueChange: (value: string) => void;
  value: string | undefined;
}

export const TabContext = createContext<null | TabContextType>(null);

export const useTabContext = () => {
  const context = useContext(TabContext);
  assert(context !== null, 'useTabContext는 Tab.Root 하위에서 사용해야해요.');
  return context;
};
