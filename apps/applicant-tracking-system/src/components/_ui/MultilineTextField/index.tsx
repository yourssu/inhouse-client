import * as React from 'react';

import { cn } from '@/utils/tw';

export interface MultilineTextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  placeholder?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
  value?: string;
  withHeightAutoResize?: boolean;
}

export const MultilineTextField = ({
  invalid,
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
      className={cn(
        'text-15 placeholder:text-grey400 ease-ease disabled:border-grey50 disabled:bg-grey100 min-h-30 w-full rounded-lg border p-3 outline-0 transition-colors duration-200 disabled:cursor-not-allowed',
        invalid
          ? 'border-red500'
          : 'border-grey200 focus:border-violet500 hover:border-violetOpacity200',
        withHeightAutoResize && 'resize-none',
        className,
      )}
      onChange={onTextareaChange}
      placeholder={placeholder}
      ref={ref}
      value={value}
      {...props}
    />
  );
};
