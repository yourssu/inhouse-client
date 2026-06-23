import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

type VariableContextType = {
  setVariableValue: (key: string, value: VariableValueType) => void;
  variableValues: Record<string, VariableValueType>;
};

export const VariableContext = createContext<null | VariableContextType>(null);

export const useVariableContext = () => {
  const context = useContext(VariableContext);
  assert(!!context, 'useVariableContext는 VariableContext.Provider 하위에서 사용해야해요.');
  return context;
};
