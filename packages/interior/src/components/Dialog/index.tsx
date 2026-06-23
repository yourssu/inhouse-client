import type { Merge } from '@yourssu-inhouse/inhouse-utils/type';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { MdClose } from 'react-icons/md';

import { type ButtonProps, Button as StyledButton } from '../Button';
import { TabButton } from '../TabButton';
import * as styles from './Dialog.css';

export interface DialogProps {
  closeableWithOutside?: boolean;
  contentProps?: DialogPrimitive.DialogContentProps;
  onClose: () => void;
  open: boolean;
}

const Header = ({
  children,
  className,
  onClickCloseButton,
}: React.PropsWithChildren<{ className?: string; onClickCloseButton?: () => void }>) => {
  return (
    <div className={clsx(styles.header, className)}>
      <div className={styles.headerLeft}>{children}</div>
      {onClickCloseButton && (
        <div className={styles.closeButtonWrapper}>
          <button className={styles.closeButton} onClick={onClickCloseButton} type="button">
            <MdClose className={styles.closeIcon} />
          </button>
        </div>
      )}
    </div>
  );
};

const Title = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className={styles.title}>{children}</div>;
};

const Content = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => {
  return <div className={clsx(styles.contentArea, className)}>{children}</div>;
};

const ButtonGroup = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => {
  return <div className={clsx(styles.buttonGroup, className)}>{children}</div>;
};

const Button = ({
  size = 'lg',
  children,
  ...props
}: Merge<ButtonProps, { size?: ButtonProps['size'] }>) => {
  return (
    <StyledButton size={size} {...props}>
      {children}
    </StyledButton>
  );
};

export const Dialog = ({
  onClose,
  open,
  closeableWithOutside,
  children,
  contentProps = {},
}: React.PropsWithChildren<DialogProps>) => {
  const onCloseWithOutside = (e: Event) => {
    if (!closeableWithOutside) {
      e.preventDefault();
    }
  };

  return (
    <DialogPrimitive.Root onOpenChange={(v) => !v && onClose()} open={open}>
      <AnimatePresence>
        {open && (
          // forceMount: 이게 있어야 exit 애니메이션이 제대로 작동해요.
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay className={styles.overlay} />

            <DialogPrimitive.Content
              {...contentProps}
              className={clsx(styles.content, contentProps.className)}
              onEscapeKeyDown={onCloseWithOutside}
              onInteractOutside={onCloseWithOutside}
              onPointerDownOutside={onCloseWithOutside}
            >
              <motion.div
                animate="animate"
                className={styles.dialogWrapper}
                exit="initial"
                initial="initial"
                transition={{
                  duration: 0.25,
                  ease: [0.25, 0.1, 0.25, 1], // timing-function: ease
                }}
                variants={{
                  initial: { opacity: 0, scale: 0.7 },
                  animate: { opacity: 1, scale: 1 },
                }}
              >
                <VisuallyHidden>
                  <DialogPrimitive.Title />
                  <DialogPrimitive.Description />
                  <DialogPrimitive.Close />
                </VisuallyHidden>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};

Dialog.Header = Header;
Dialog.Content = Content;
Dialog.Title = Title;
Dialog.ButtonGroup = ButtonGroup;
Dialog.Button = Button;

// TabDialog Implementation
interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const NavPannel = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <div className={styles.tabDialogNavPanel}>
      <aside className={styles.tabDialogNavPanelAside}>{children}</aside>
    </div>
  );
};

const NavButton = ({
  children,
  className,
  active,
  ...props
}: React.PropsWithChildren<NavButtonProps>) => {
  return (
    <TabButton active={active} className={className} size="lg" {...props}>
      {children}
    </TabButton>
  );
};

const ContentPannel = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className={styles.tabDialogContentPanel}>{children}</div>;
};

const TabContent = ({ children, className }: React.ComponentProps<typeof Dialog.Content>) => {
  return (
    <Dialog.Content className={clsx(styles.tabDialogContent, className)}>{children}</Dialog.Content>
  );
};

const TabButtonGroup = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog.ButtonGroup>) => {
  return (
    <Dialog.ButtonGroup className={clsx(styles.tabDialogButtonGroup, className)} {...props}>
      {children}
    </Dialog.ButtonGroup>
  );
};

const TabButtonComponent = ({
  children,
  size = 'md',
  ...props
}: React.ComponentProps<typeof Dialog.Button>) => {
  return (
    <Dialog.Button size={size} {...props}>
      {children}
    </Dialog.Button>
  );
};

export const TabDialog = ({
  children,
  contentProps,
  ...props
}: React.PropsWithChildren<DialogProps>) => {
  const mergedContentProps = {
    ...contentProps,
    className: clsx(styles.tabDialogContentSize, contentProps?.className),
  };
  return (
    <Dialog contentProps={mergedContentProps} {...props}>
      <div className={styles.tabDialogWrapper}>{children}</div>
    </Dialog>
  );
};

const PannelGroup = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className={styles.tabDialogPanelGroup}>{children}</div>;
};

TabDialog.PannelGroup = PannelGroup;
TabDialog.NavPannel = NavPannel;
TabDialog.NavButton = NavButton;
TabDialog.ContentPannel = ContentPannel;
TabDialog.Header = Dialog.Header;
TabDialog.Content = TabContent;
TabDialog.Title = Dialog.Title;
TabDialog.ButtonGroup = TabButtonGroup;
TabDialog.Button = TabButtonComponent;
