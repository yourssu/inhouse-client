import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';

import * as styles from './Sidebar.css';

export interface SidebarProps {
  contentProps?: DialogPrimitive.DialogContentProps;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger: React.ReactElement;
}

export const Sidebar = ({
  children,
  contentProps = {},
  label,
  onOpenChange,
  open,
  trigger,
}: React.PropsWithChildren<SidebarProps>) => {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay className={styles.overlay} />
            <DialogPrimitive.Content
              {...contentProps}
              aria-describedby={contentProps['aria-describedby']}
              className={clsx(styles.content, contentProps.className)}
            >
              <motion.div
                animate="open"
                className={styles.panel}
                exit="closed"
                initial="closed"
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                variants={{ closed: { x: '-100%' }, open: { x: 0 } }}
              >
                <VisuallyHidden>
                  <DialogPrimitive.Title>{label}</DialogPrimitive.Title>
                </VisuallyHidden>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};
