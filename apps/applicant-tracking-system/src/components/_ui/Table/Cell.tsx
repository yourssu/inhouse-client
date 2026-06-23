import { cn } from 'tailwind-variants';

type CellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
  ref?: React.Ref<HTMLTableCellElement>;
};

export const Cell = ({
  children,
  className,
  align,
  ...props
}: React.PropsWithChildren<CellProps>) => {
  return (
    <td
      className={cn(
        'text-neutralMuted flex h-12 w-32 min-w-32 flex-[1_1] not-first-of-type:*:justify-end first-of-type:rounded-l-md first-of-type:pl-2 last-of-type:rounded-r-md last-of-type:pr-2',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'hide-scrollbar flex w-full min-w-0 items-center overflow-x-auto overflow-y-hidden px-1 overflow-ellipsis whitespace-nowrap',
          align !== undefined ? (align === 'left' ? 'justify-start!' : 'justify-end!') : undefined,
        )}
      >
        {children}
      </div>
    </td>
  );
};
