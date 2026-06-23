import { noop } from 'es-toolkit';
import { useCallback, useRef } from 'react';

type OAuthCode = string | undefined;
type ResolverFn = (value: OAuthCode | PromiseLike<OAuthCode>) => void;

export const useGoogleOAuthPopup = () => {
  const pollingRef = useRef<number | undefined>(undefined);
  const resolverRef = useRef<ResolverFn | undefined>(undefined);

  const isPopupOnInitialPage = (url: string, popup: Window) => {
    return (
      popup.location.href === url ||
      popup.location.pathname === 'blank' ||
      popup.location.href === 'about:blank'
    );
  };

  const extractOAuthResponse = (popup: Window) => {
    const queryParams = new URLSearchParams(popup.location.search);
    return queryParams.get('code');
  };

  const cleanupPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = undefined;
    }
  };

  const resolveCode = useCallback((code: string | undefined) => {
    cleanupPolling();
    resolverRef.current?.(code);
    resolverRef.current = undefined;
  }, []);

  const startPolling = useCallback(
    (url: string, popup: null | Window) => {
      if (!popup) {
        return;
      }

      pollingRef.current = setInterval(() => {
        try {
          // 팝업이 닫힌 경우
          if (!popup || popup.closed) {
            resolveCode(undefined);
            return;
          }

          // 팝업이 초기 페이지에 머무르는 경우
          if (isPopupOnInitialPage(url, popup)) {
            return;
          }

          const code = extractOAuthResponse(popup);
          popup.close();
          resolveCode(code ?? undefined);
        } catch {
          /* 
            폴링으로 구현되어 있어 Cross-Origin-Opener-Policy로 인해서 지속적 에러가 발생해요.
            OAuth 플로우가 종료되면 다시 같은 origin으로 돌아와요.
          */
          noop();
        }
      }, 500);
    },
    [resolveCode],
  );

  const open = useCallback(
    (url: string, width: number, height: number) => {
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        url,
        'Google에 로그인',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      startPolling(url, popup);

      return new Promise<OAuthCode>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [startPolling],
  );

  return open;
};
