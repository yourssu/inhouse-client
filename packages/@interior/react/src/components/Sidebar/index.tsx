import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, use } from 'react';

import * as styles from './Sidebar.css';

export interface SidebarProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export type SidebarTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;
export type SidebarContentProps = React.ComponentProps<typeof DialogPrimitive.Content>;

interface SidebarContextValue {
  open: boolean;
}

const SidebarContext = createContext<null | SidebarContextValue>(null);

const useSidebarContext = () => {
  const context = use(SidebarContext);

  if (!context) {
    throw new Error('Sidebar.Content must be used within Sidebar.');
  }

  return context;
};

const Trigger = ({ asChild = true, ...props }: SidebarTriggerProps) => {
  return <DialogPrimitive.Trigger {...props} asChild={asChild} />;
};

const Content = ({ children, className, ...props }: SidebarContentProps) => {
  const { open } = useSidebarContext();

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay className={styles.overlay} />
          <DialogPrimitive.Content
            {...props}
            aria-describedby={props['aria-describedby']}
            className={clsx(styles.content, className)}
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
                <DialogPrimitive.Title>사이드바</DialogPrimitive.Title>
              </VisuallyHidden>
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
};

const SidebarRoot = ({ children, onOpenChange, open }: React.PropsWithChildren<SidebarProps>) => {
  return (
    <SidebarContext.Provider value={{ open }}>
      <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
        {children}
      </DialogPrimitive.Root>
    </SidebarContext.Provider>
  );
};

export const Sidebar = Object.assign(SidebarRoot, { Content, Trigger });
