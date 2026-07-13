import * as RadixPopover from '@radix-ui/react-popover';
import clsx from 'clsx';

import { Popover, type PopoverProps } from '@/components/Popover';
import { usePopoverBehavior } from '@/components/Popover/hook';
import { popoverSurface } from '@/styles/recipes/popoverSurface.css.ts';

import * as styles from './Menu.css';

interface ButtonItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

// Todo: Menu 트리거 이후 포커싱이 ButtonItem으로 안잡히는 문제가 있음
const ButtonItem = ({
  children,
  className,
  icon,
  ...props
}: React.PropsWithChildren<ButtonItemProps>) => {
  return (
    <Popover.Closeable asChild>
      <button className={clsx(styles.buttonItem, className)} {...props}>
        <div className={styles.buttonItemInner}>
          {icon && <div className={styles.iconWrapper}>{icon}</div>}
          <span className={styles.label({ hasIcon: !!icon })}>{children}</span>
        </div>
      </button>
    </Popover.Closeable>
  );
};

const Content = ({
  children,
  className,
  sideOffset = 8,
  ...props
}: RadixPopover.PopoverContentProps) => {
  const { onPointerEnter, onPointerLeave } = usePopoverBehavior();

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    props.onClick?.(e);
  };

  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        className={styles.content}
        {...props}
        onClick={onClick}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
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
        <div className={clsx(popoverSurface({ padding: 'xs' }), styles.contentInner, className)}>
          {children}
        </div>
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
};

export const Menu = ({ children, ...props }: React.PropsWithChildren<PopoverProps>) => {
  return <Popover {...props}>{children}</Popover>;
};

Menu.Trigger = Popover.Trigger;
Menu.Content = Content;
Menu.ButtonItem = ButtonItem;
