import type { ReactNode, Ref } from 'react';

interface QuestionnaireErrorMessageProps {
  children: ReactNode;
  ref?: Ref<HTMLParagraphElement>;
  tabIndex?: number;
}

export const QuestionnaireErrorMessage = ({
  children,
  ref,
  tabIndex,
}: QuestionnaireErrorMessageProps) => (
  <p className="text-13 text-red600 whitespace-pre-line" ref={ref} role="alert" tabIndex={tabIndex}>
    {children}
  </p>
);
