import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { type ReactNode, StrictMode } from 'react';

export interface AppProvidersProps {
  children: ReactNode;
  queryClient: QueryClient;
  strictMode?: boolean;
  toastDuration?: number;
}

export const AppProviders = ({
  queryClient,
  toastDuration = 3000,
  strictMode = true,
  children,
}: AppProvidersProps) => {
  const providers = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider duration={toastDuration}>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (!strictMode) {
    return providers;
  }

  return <StrictMode>{providers}</StrictMode>;
};
