import clsx from 'clsx';

import { HoverTooltip, type HoverTooltipContentProps } from '../HoverTooltip';
import * as styles from './IconButton.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl' | 'xxs';
  tooltipContent?: React.ReactNode;
  tooltipProps?: HoverTooltipContentProps;
  variant?: 'dimmed' | 'inline';
}

export const IconButton = ({
  children,
  size,
  tooltipContent,
  tooltipProps,
  className,
  variant = 'inline',
  ...props
}: React.PropsWithChildren<IconButtonProps>) => {
  const { className: tooltipClassName, ...otherTooltipProps } = tooltipProps ?? {};

  const btn = (
    <button className={clsx(styles.button({ size, variant }), className)} {...props}>
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
          className: clsx(styles.tooltip, tooltipClassName),
          ...otherTooltipProps,
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
