import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

interface ChipTabPrimitiveContextType {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ChipTabPrimitiveContext = createContext<ChipTabPrimitiveContextType | null>(null);

export const useChipTabPrimitiveContext = () => {
  const context = useContext(ChipTabPrimitiveContext);
  assert(!!context, 'useChipTabPrimitiveContext는 ChipTabPrimitive 하위에서 사용해야해요.');
  return context;
};
