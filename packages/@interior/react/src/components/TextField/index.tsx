import clsx from 'clsx';

import { Fieldset } from '../Fieldset';
import * as styles from './TextField.css';

export type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  description?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  size: 'lg' | 'md';
  variant: 'dimmed' | 'outline';
};

export const TextField = ({
  className,
  description,
  invalid,
  label,
  size,
  variant,
  ...props
}: TextFieldProps) => {
  return (
    <Fieldset help={description} label={label}>
      <input
        className={clsx(styles.textFieldStyle({ variant, size, invalid }), className)}
        type="text"
        {...props}
      />
    </Fieldset>
  );
};
