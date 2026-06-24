import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { OverlayProvider } from 'overlay-kit';
import { StrictMode, type ReactNode } from 'react';

export interface AppProvidersProps {
  queryClient: QueryClient;
  toastDuration?: number;
  strictMode?: boolean;
  children: ReactNode;
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
        <ToastProvider duration={toastDuration}>
          <OverlayProvider>{children}</OverlayProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (!strictMode) {
    return providers;
  }

  return <StrictMode>{providers}</StrictMode>;
};
