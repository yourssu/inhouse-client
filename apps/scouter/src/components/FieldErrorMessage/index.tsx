import type { ReactNode, Ref } from 'react';

interface FieldErrorMessageProps {
  children: ReactNode;
  ref?: Ref<HTMLParagraphElement>;
  tabIndex?: number;
}

export const FieldErrorMessage = ({ children, ref, tabIndex }: FieldErrorMessageProps) => (
  <p className="text-13 text-red600 whitespace-pre-line" ref={ref} role="alert" tabIndex={tabIndex}>
    {children}
  </p>
);
