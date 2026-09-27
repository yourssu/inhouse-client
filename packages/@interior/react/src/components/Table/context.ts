import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface TableContextType {
  showStickyShadow?: boolean;
  stickyHorizontal?: boolean;
}

export const TableContext = createContext<null | TableContextType>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);
  assert(!!context, 'useTableContext는 Table.Provider 하위에서 사용해야해요.');
  return context;
};
