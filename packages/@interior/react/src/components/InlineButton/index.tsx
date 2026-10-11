import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';

import * as styles from './InlineButton.css';

interface InlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const InlineButton = ({ className, children, ...props }: InlineButtonProps) => {
  const Comp = props.asChild ? Slot : 'button';

  return (
    <Comp className={clsx(styles.root, className)} {...props}>
      {children}
    </Comp>
  );
};
