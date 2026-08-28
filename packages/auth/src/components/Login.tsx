import { type ReactNode, useCallback, useState } from 'react';

import { useAuth } from '../contexts/AuthProvider';
import { useGoogleOAuthPopup } from '../hooks/useGoogleOAuthPopup';

interface LoginRenderProps {
  isLoading: boolean;
  login: () => Promise<void>;
}

interface LoginProps {
  /**
   * headless 렌더 프로퍼티예요. 실제 UI(버튼·로고·카피)는 사용하는 쪽에서
   * `isLoading`/`login` 을 받아 렌더해요. 인증 로직은 패키지가 책임져요.
   */
  children: (props: LoginRenderProps) => ReactNode;
  onError?: (error: unknown) => void;
  onSuccess?: () => Promise<void> | void;
}

const POPUP_WIDTH = 580;
const POPUP_HEIGHT = 720;

export const Login = ({ onSuccess, onError, children }: LoginProps) => {
  const { login: loginWithCode, config } = useAuth();
  const open = useGoogleOAuthPopup();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const code = await open(config.googleOAuthURL, POPUP_WIDTH, POPUP_HEIGHT);
      if (!code) {
        return;
      }
      await loginWithCode(code);
      await onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [config.googleOAuthURL, loginWithCode, onSuccess, onError, open]);

  return <>{children({ isLoading, login })}</>;
};
