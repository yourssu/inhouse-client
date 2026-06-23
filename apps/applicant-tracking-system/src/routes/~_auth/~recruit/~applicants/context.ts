import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

import { useMultiSelectActions } from '@/hooks/useMultiSelectActions';

type ApplicantSelectionContextType = ReturnType<typeof useMultiSelectActions<number>>;

export const ApplicantSelectionContext = createContext<ApplicantSelectionContextType | null>(null);

export const useApplicantSelectionContext = () => {
  const context = useContext(ApplicantSelectionContext);
  assert(!!context, 'useApplicantSelection는 ApplicantSelectionProvider 하위에서 사용해야해요.');
  return context;
};
