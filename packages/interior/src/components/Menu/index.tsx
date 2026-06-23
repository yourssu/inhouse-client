import type { PopoverContentProps } from '@radix-ui/react-popover';

import clsx from 'clsx';

import { Popover, type PopoverProps } from '../Popover';
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

const Content = ({ children, className, sideOffset = 2, ...props }: PopoverContentProps) => {
  return (
    <Popover.Content
      {...props}
      className={className}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
      }}
      sideOffset={sideOffset}
    >
      <div className={styles.contentInner}>{children}</div>
    </Popover.Content>
  );
};

export const Menu = ({ children, ...props }: React.PropsWithChildren<PopoverProps>) => {
  return <Popover {...props}>{children}</Popover>;
};

Menu.Trigger = Popover.Trigger;
Menu.Content = Content;
Menu.ButtonItem = ButtonItem;
