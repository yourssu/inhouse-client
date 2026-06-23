import { assert } from 'es-toolkit';
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';

import type { PartNameType } from '@/apis/parts/schema';

export type MailSelection = {
  partName: Exclude<PartNameType, 'Head lead'> | null;
  templateId: null | number;
};

export type MailSelectionContextType = {
  mailSelection: MailSelection;
  setMailSelection: Dispatch<SetStateAction<MailSelection>>;
};

export const MailSelectionContext = createContext<MailSelectionContextType | null>(null);

export const useMailSelectionContext = () => {
  const context = useContext(MailSelectionContext);
  assert(
    !!context,
    'useMailSelectionContext는 MailSelectionContext.Provider 하위에서 사용해야해요.',
  );
  return context;
};
