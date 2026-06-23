import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/utils/tw';

interface InlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const InlineButton = ({ className, children, ...props }: InlineButtonProps) => {
  const Comp = props.asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'hover:bg-greyOpacity100 focus-visible:bg-greyOpacity100 ease-ease inline-block cursor-pointer rounded-md px-1.5 transition-colors duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};
