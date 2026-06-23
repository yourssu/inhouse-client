import { cn } from '@/utils/tw';

type RowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  hoverable?: boolean;
  onClick?: () => void;
  ref?: React.Ref<HTMLTableRowElement>;
};

export const Row = ({
  children,
  className,
  hoverable = false,
  onClick,
  onKeyDown,
  ...props
}: RowProps) => {
  const hoverableAttributes = {
    'data-focus-visible': true,
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(e);
      if (e.key === 'Enter' || e.key === ' ') {
        onClick?.();
      }
    },
  };

  return (
    <tr
      className={cn(
        'nth-of-type-[2n+1]:bg-tableBackground flex h-12 rounded-md text-sm',
        hoverable &&
          'hover:bg-grey100 hover:nth-of-type-[2n+1]:bg-grey100 cursor-pointer focus-visible:z-100',
        className,
      )}
      onClick={onClick}
      {...(hoverable && hoverableAttributes)}
      {...props}
    >
      {children}
    </tr>
  );
};
