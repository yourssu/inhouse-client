import { Button, type ButtonProps } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

interface SelectionBarActionProps extends Omit<ButtonProps, 'left' | 'right' | 'size' | 'variant'> {
  icon?: React.ReactNode;
}

export const SelectionBarActionButton = ({
  children,
  icon,
  className,
  ...props
}: SelectionBarActionProps) => {
  return (
    <Button
      {...props}
      className={cn('text-neutralMuted text-15 px-2', className)}
      left={icon}
      size="md"
      variant="transparent"
    >
      {children}
    </Button>
  );
};
