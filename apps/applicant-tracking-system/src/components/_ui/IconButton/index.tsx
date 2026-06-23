import { HoverTooltip, type HoverTooltipContentProps } from '@/components/_ui/HoverTooltip';
import { cn, tv } from '@/utils/tw';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl' | 'xxs';
  tooltipContent?: React.ReactNode;
  tooltipProps?: HoverTooltipContentProps;
  variant?: 'dimmed' | 'inline';
}

const button = tv({
  base: 'enabled:hover:bg-greyOpacity200 disabled:text-greyOpacity400 ease-ease flex cursor-pointer items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed',
  variants: {
    size: {
      xxs: 'size-5 rounded-sm', // 20px -> xxs이동
      xs: 'size-6 rounded-sm', // new
      sm: 'size-7 rounded-sm', // 28px, 유지
      md: 'size-8 rounded-md', // 32px, 유지
      lg: 'size-9.5 rounded-lg', // 40px -> 38px
      xl: 'size-12 rounded-xl', // new
      xxl: 'size-17 rounded-2xl', // new
    },
    variant: {
      dimmed: 'bg-greyOpacity100 disabled:text-greyOpacity300',
      inline: '',
    },
  },
});

export const IconButton = ({
  children,
  size,
  tooltipContent,
  tooltipProps,
  className,
  variant = 'inline',
  ...props
}: React.PropsWithChildren<IconButtonProps>) => {
  const btn = (
    <button className={cn(button({ size, variant }), className)} {...props}>
      {children}
    </button>
  );

  if (tooltipContent) {
    return (
      <HoverTooltip
        content={tooltipContent}
        contentProps={{
          side: 'bottom',
          sideOffset: 4,
          className: 'py-1.5 px-2.5 rounded-md font-semibold',
          ...tooltipProps,
        }}
        disableHoverableContent
        noArrow
      >
        {btn}
      </HoverTooltip>
    );
  }

  return btn;
};
