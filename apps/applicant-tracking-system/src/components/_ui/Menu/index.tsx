import type { PopoverContentProps } from '@radix-ui/react-popover';

import clsx from 'clsx';

import { Popover, type PopoverProps } from '@/components/_ui/Popover';
import { cn } from '@/utils/tw';

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
      <button
        className={cn(
          'hover:bg-greyOpacity100 text-greyOpacity800 text-15 ease-ease cursor-pointer rounded-lg p-2 font-medium transition-colors duration-200',
          className,
        )}
        {...props}
      >
        <div className="flex items-center">
          {icon && <div className="text-greyOpacity500 text-base">{icon}</div>}
          <span className={clsx('flex-[1_1] px-1.5', icon && 'text-left')}>{children}</span>
        </div>
      </button>
    </Popover.Closeable>
  );
};

const Content = ({ children, className, sideOffset = 2, ...props }: PopoverContentProps) => {
  return (
    <Popover.Content
      {...props}
      className={cn(
        'bg-floatBackground min-w-30 rounded-xl p-2 shadow-[0_0_0_1px_var(--shadowMedium00),0_10px_30px_0_var(--shadowMedium01),0_20px_40px_0_var(--shadowMedium02)]',
        className,
      )}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
      }}
      sideOffset={sideOffset}
    >
      <div className="flex w-full flex-col">{children}</div>
    </Popover.Content>
  );
};

export const Menu = ({ children, ...props }: React.PropsWithChildren<PopoverProps>) => {
  return <Popover {...props}>{children}</Popover>;
};

Menu.Target = Popover.Target;
Menu.Content = Content;
Menu.ButtonItem = ButtonItem;
