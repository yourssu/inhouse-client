import * as Tooltip from '@radix-ui/react-tooltip';

import { vars } from '@/styles/__generated__/colors.gen';
import { cn } from '@/utils/tw';

export type HoverTooltipContentProps = React.ComponentProps<typeof Tooltip.Content>;

interface Props {
  color?: Extract<keyof typeof vars, `grey${string}`>;
  content: React.ReactNode;
  contentProps?: HoverTooltipContentProps;
  disableHoverableContent?: boolean;
  noArrow?: boolean;
}

export const HoverTooltip = ({
  children,
  content,
  color,
  contentProps,
  noArrow,
  disableHoverableContent,
}: React.PropsWithChildren<Props>) => {
  const { className, sideOffset, ...otherContentProps } = contentProps ?? {};

  return (
    <Tooltip.Provider
      delayDuration={0}
      disableHoverableContent={disableHoverableContent}
      skipDelayDuration={0}
    >
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            {...otherContentProps}
            className={cn(
              'bg-backgroundLevel02 text-13 shadow-tooltip z-20 max-w-60 rounded-[14px] px-5.5 py-3.5',
              className,
            )}
            sideOffset={sideOffset ?? 10}
            style={{
              backgroundColor: color && vars[color],
            }}
          >
            {!noArrow && (
              <Tooltip.Arrow
                className="fill-backgroundLevel02 h-[9px] w-4"
                style={{
                  fill: color && vars[color],
                }}
              />
            )}
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
