import { STAGE } from '@/config';

export const bootstrap = async () => {
  if (STAGE !== 'dev') {
    return;
  }

  const { http, passthrough } = await import('msw');
  const { setupWorker } = await import('msw/browser');
  const { handlers } = await import('@/mocks/handlers');
  const worker = setupWorker(
    http.all('*', ({ request }) => {
      const pathname = window.location.pathname;

      // Member's worker shares the shell origin with every service.
      if (
        (pathname !== '/members' && !pathname.startsWith('/members/')) ||
        new URL(request.url).pathname === '/members/me'
      ) {
        return passthrough();
      }
    }),
    ...handlers,
  );

  await worker.start({
    onUnhandledRequest: 'bypass',
    // Service workers must be registered from the shell document's origin.
    serviceWorker: { url: new URL('mockServiceWorker.js', window.location.origin).href },
  });

  return () => worker.stop();
};
