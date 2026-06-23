import { forwardRef } from 'react';

import { cn, tv } from '@/utils/tw';

export interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  size: 'lg' | 'md';
}

const container = tv({
  base: 'ease-ease flex w-full cursor-pointer items-center justify-start gap-2 transition-colors duration-200',
  variants: {
    active: {
      true: 'bg-greyOpacity100 text-neutral font-semibold',
      false: 'text-neutralMuted hover:bg-greyOpacity100 font-medium',
    },
    size: {
      md: 'h-8 rounded-md px-3 text-sm',
      lg: 'text-15 h-9.5 rounded-lg px-3.5',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ active, size, left, right, children, className, ...props }, ref) => {
    return (
      <button
        className={cn(container({ active, size }), className)}
        ref={ref}
        type="button"
        {...props}
      >
        {left && <div className="flex shrink-0 items-center justify-center">{left}</div>}
        <span className="flex flex-1 items-center truncate text-left">{children}</span>
        {right && <div className="flex shrink-0 items-center justify-center">{right}</div>}
      </button>
    );
  },
);

TabButton.displayName = 'TabButton';
