import { useContext } from 'react';

import { PopoverContext } from '@/components/_ui/Popover/context';

export const usePopoverBehavior = () => {
  const { behavior, setOpen } = useContext(PopoverContext);

  const onClick = () => {
    if (behavior === 'click') {
      setOpen((prev) => !prev);
    }
  };

  const onPointerEnter = () => {
    if (behavior === 'hover') {
      setOpen(true);
    }
  };

  const onPointerLeave = () => {
    if (behavior === 'hover') {
      setOpen(false);
    }
  };

  return { onClick, onPointerEnter, onPointerLeave };
};
