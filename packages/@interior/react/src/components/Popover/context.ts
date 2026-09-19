import { createContext, type Dispatch, type SetStateAction } from 'react';

import type { PopoverBehaviorType } from './type';

type PopoverContextType = {
  behavior: PopoverBehaviorType;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const PopoverContext = createContext<PopoverContextType>({
  behavior: 'click',
  open: false,
  setOpen: () => {},
});
