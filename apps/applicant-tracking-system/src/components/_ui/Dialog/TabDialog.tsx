import { Dialog, type DialogProps } from '@/components/_ui/Dialog';
import { TabButton } from '@/components/_ui/TabButton';
import { cn } from '@/utils/tw';

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const NavPannel = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <div className="border-greyOpacity100 sticky top-0 flex-[27.8_1_0] border-r">
      <aside className="flex size-full flex-col gap-1 px-4 py-5">{children}</aside>
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
  return <div className="flex flex-[72.2_1_0] flex-col">{children}</div>;
};

const Content = ({ children, className }: React.ComponentProps<typeof Dialog.Content>) => {
  return (
    <Dialog.Content className={cn('flex-[1_1_0] overflow-y-auto', className)}>
      {children}
    </Dialog.Content>
  );
};

const ButtonGroup = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog.ButtonGroup>) => {
  return (
    <Dialog.ButtonGroup
      className={cn('border-greyOpacity100 flex border-t px-6 py-5', className)}
      {...props}
    >
      {children}
    </Dialog.ButtonGroup>
  );
};

const Button = ({
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
  const mergedContentProps = { ...contentProps, className: 'w-[720px] h-[620px]' };
  return (
    <Dialog contentProps={mergedContentProps} {...props}>
      <div className="flex size-full flex-col">{children}</div>
    </Dialog>
  );
};

const PannelGroup = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="flex flex-[1_1_0] overflow-y-auto">{children}</div>;
};

TabDialog.PannelGroup = PannelGroup;
TabDialog.NavPannel = NavPannel;
TabDialog.NavButton = NavButton;
TabDialog.ContentPannel = ContentPannel;
TabDialog.Header = Dialog.Header;
TabDialog.Content = Content;
TabDialog.Title = Dialog.Title;
TabDialog.ButtonGroup = ButtonGroup;
TabDialog.Button = Button;
