import * as PrimivtivePopover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { type SetStateAction, useContext, useState } from 'react';

import type { PopoverBehaviorType } from './type';

import { PopoverContext } from './context';
import { usePopoverBehavior } from './hook';
import * as styles from './Popover.css';

export interface PopoverProps {
  behavior?: PopoverBehaviorType;
  onOpenChange?: (v: boolean) => void;
}

interface ContentProps extends PrimivtivePopover.PopoverContentProps {
  onCloseWithOutside?: () => void;
}

const Content = ({
  children,
  className,
  sideOffset,
  onCloseWithOutside,
  ...props
}: React.PropsWithChildren<ContentProps>) => {
  const { onPointerEnter, onPointerLeave } = usePopoverBehavior();

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    props.onClick?.(e);
  };

  return (
    <PrimivtivePopover.Portal>
      <PrimivtivePopover.Content
        className={styles.primitiveContent}
        {...props}
        onClick={onClick}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          onCloseWithOutside?.();
        }}
        onEscapeKeyDown={onCloseWithOutside}
        onFocusOutside={onCloseWithOutside}
        onInteractOutside={onCloseWithOutside}
        onPointerDownOutside={onCloseWithOutside}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        sideOffset={sideOffset}
      >
        {sideOffset && (
          <div
            style={
              props.side === 'top' || props.side === 'bottom'
                ? { height: sideOffset }
                : { width: sideOffset }
            }
          />
        )}
        <div className={clsx(styles.popoverInner, className)}>{children}</div>
      </PrimivtivePopover.Content>
    </PrimivtivePopover.Portal>
  );
};

const Trigger = ({
  children,
  className,
  asChild = true,
  ...props
}: React.PropsWithChildren<PrimivtivePopover.PopoverTriggerProps>) => {
  const { onClick, onPointerEnter, onPointerLeave } = usePopoverBehavior();

  return (
    <PrimivtivePopover.Trigger
      {...props}
      asChild={asChild}
      className={clsx(styles.trigger, className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      tabIndex={asChild ? props.tabIndex : -1}
    >
      {children}
    </PrimivtivePopover.Trigger>
  );
};

export const Closeable = ({
  children,
  asChild,
}: React.PropsWithChildren<{ asChild?: boolean }>) => {
  const Comp = asChild ? Slot : 'div';

  const { setOpen } = useContext(PopoverContext);
  return <Comp onClick={() => setOpen(false)}>{children}</Comp>;
};

export const Popover = ({
  children,
  behavior = 'click',
  onOpenChange,
}: React.PropsWithChildren<PopoverProps>) => {
  const [open, setOpen] = useState(false);

  const setOpenWrapper = (v: SetStateAction<boolean>) => {
    if (typeof v === 'function') {
      const next = v(open);
      onOpenChange?.(next);
      setOpen(() => next);
    } else {
      onOpenChange?.(v);
      setOpen(v);
    }
  };

  return (
    <PopoverContext.Provider value={{ behavior, open, setOpen: setOpenWrapper }}>
      <PrimivtivePopover.Root onOpenChange={(v) => setOpenWrapper(v)} open={open}>
        {children}
      </PrimivtivePopover.Root>
    </PopoverContext.Provider>
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;
Popover.Closeable = Closeable;
