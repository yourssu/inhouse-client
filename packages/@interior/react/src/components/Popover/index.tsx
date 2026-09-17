import * as PrimitivePopover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { type SetStateAction, useContext, useState } from 'react';

import { popoverSurface } from '@/styles/recipes/popoverSurface.css.ts';

import type { PopoverBehaviorType } from './type';

import { PopoverContext } from './context';
import { usePopoverBehavior } from './hook';
import * as styles from './Popover.css';

export interface PopoverProps {
  behavior?: PopoverBehaviorType;
  onOpenChange?: (v: boolean) => void;
  open?: boolean;
}

interface ContentProps extends PrimitivePopover.PopoverContentProps {
  onCloseWithOutside?: () => void;
}

const Content = ({
  children,
  className,
  side = 'bottom',
  sideOffset = 8,
  onCloseWithOutside,
  ...props
}: React.PropsWithChildren<ContentProps>) => {
  const { onPointerEnter, onPointerLeave } = usePopoverBehavior();

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    props.onClick?.(e);
  };

  return (
    <PrimitivePopover.Portal>
      <PrimitivePopover.Content
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
        side={side}
        sideOffset={0}
      >
        {side === 'bottom' && <div style={{ height: sideOffset }} />}
        <div
          style={
            side === 'left'
              ? { paddingRight: sideOffset }
              : side === 'right'
                ? { paddingLeft: sideOffset }
                : {}
          }
        >
          <div className={clsx(popoverSurface({ padding: 'lg' }), className)}>{children}</div>
        </div>
        {side === 'top' && <div style={{ height: sideOffset }} />}
      </PrimitivePopover.Content>
    </PrimitivePopover.Portal>
  );
};

const Trigger = ({
  children,
  className,
  asChild = true,
  ...props
}: React.PropsWithChildren<PrimitivePopover.PopoverTriggerProps>) => {
  const { onClick, onPointerEnter, onPointerLeave } = usePopoverBehavior();

  return (
    <PrimitivePopover.Trigger
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
    </PrimitivePopover.Trigger>
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
  open: controlledOpen,
}: React.PropsWithChildren<PopoverProps>) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpenWrapper = (v: SetStateAction<boolean>) => {
    const next = typeof v === 'function' ? v(open) : v;
    onOpenChange?.(next);

    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
  };

  return (
    <PopoverContext.Provider value={{ behavior, open, setOpen: setOpenWrapper }}>
      <PrimitivePopover.Root onOpenChange={(v) => setOpenWrapper(v)} open={open}>
        {children}
      </PrimitivePopover.Root>
    </PopoverContext.Provider>
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;
Popover.Closeable = Closeable;
