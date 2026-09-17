import * as Tooltip from '@radix-ui/react-tooltip';
import { vars } from '@yourssu-inhouse/interior-vars';
import clsx from 'clsx';

import * as styles from './HoverTooltip.css';

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
            className={clsx(styles.content, className)}
            sideOffset={sideOffset ?? 10}
            style={{
              backgroundColor: color && vars[color],
            }}
          >
            {!noArrow && (
              <Tooltip.Arrow
                className={styles.arrow}
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
