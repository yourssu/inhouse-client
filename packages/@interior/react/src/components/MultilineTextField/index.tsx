import clsx from 'clsx';
import * as React from 'react';

import * as styles from './MultilineTextField.css';

export interface MultilineTextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  placeholder?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
  value?: string;
  withHeightAutoResize?: boolean;
}

export const MultilineTextField = ({
  invalid = false,
  placeholder,
  className,
  ref,
  onChange,
  withHeightAutoResize = false,
  value,
  ...props
}: MultilineTextFieldProps) => {
  const onTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    if (withHeightAutoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <textarea
      className={clsx(styles.textarea({ invalid, resizeNone: withHeightAutoResize }), className)}
      onChange={onTextareaChange}
      placeholder={placeholder}
      ref={ref}
      value={value}
      {...props}
    />
  );
};
