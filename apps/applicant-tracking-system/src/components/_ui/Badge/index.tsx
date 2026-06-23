import { cn, tv } from '@/utils/tw';

interface BadgeProps {
  className?: string;
  color: 'blue' | 'green' | 'grey' | 'red' | 'violet' | 'yellow';
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs';
}

const badge = tv({
  base: 'inline-flex w-fit items-center rounded-full py-0 font-medium',
  variants: {
    color: {
      blue: 'bg-blueOpacity50 text-blue600',
      green: 'bg-greenOpacity50 text-green600',
      grey: 'bg-greyOpacity50 text-grey600',
      red: 'bg-redOpacity50 text-red600',
      violet: 'bg-violet50 text-violet600',
      yellow: 'bg-yellow50 text-yellow600',
    },
    size: {
      xs: 'h-[15px] px-1.5 text-[9px]',
      sm: 'text-tiny h-5 px-1.5',
      md: 'text-13 h-6 px-2',
      lg: 'h-7 px-2.5 text-sm',
      xl: 'text-15 h-8 px-3',
    },
  },
});

export const Badge = ({
  children,
  className,
  color,
  size,
}: React.PropsWithChildren<BadgeProps>) => {
  return <div className={cn(badge({ color, size }), className)}>{children}</div>;
};
