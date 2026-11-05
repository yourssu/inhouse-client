import { ThemeProvider, ToastProvider } from '@interior/react';
import { type ReactNode, StrictMode } from 'react';

export interface AppProvidersProps {
  children: ReactNode;
  strictMode?: boolean;
  toastDuration?: number;
}

export const AppProviders = ({
  toastDuration = 3000,
  strictMode = true,
  children,
}: AppProvidersProps) => {
  const providers = (
    <ThemeProvider>
      <ToastProvider duration={toastDuration}>{children}</ToastProvider>
    </ThemeProvider>
  );

  if (!strictMode) {
    return providers;
  }

  return <StrictMode>{providers}</StrictMode>;
};
