import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type AuthApiClient, type AuthConfig, AuthProvider } from '@yourssu-inhouse/auth';
import { ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { type ReactNode, StrictMode } from 'react';

export interface AppProvidersProps {
  authClient?: AuthApiClient;
  authConfig: AuthConfig;
  children: ReactNode;
  queryClient: QueryClient;
  strictMode?: boolean;
  toastDuration?: number;
}

export const AppProviders = ({
  authClient,
  authConfig,
  queryClient,
  toastDuration = 3000,
  strictMode = true,
  children,
}: AppProvidersProps) => {
  const providers = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider duration={toastDuration}>
          <AuthProvider client={authClient} config={authConfig}>
            {children}
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (!strictMode) {
    return providers;
  }

  return <StrictMode>{providers}</StrictMode>;
};
