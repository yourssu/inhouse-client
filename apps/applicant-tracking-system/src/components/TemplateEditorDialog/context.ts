import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

interface VariableContextType {
  addVariable: (variable: Omit<VariableItem, 'id'>) => void;
  insertVariable: (variable: VariableItem) => void;
  removeVariable: (id: string) => void;
  variables: VariableItem[];
}

export const VariableContext = createContext<null | VariableContextType>(null);

export const useVariableContext = () => {
  const context = useContext(VariableContext);
  assert(!!context, 'useVariableContext는 VariableContext.Provider 하위에서 사용해야해요.');
  return context;
};
