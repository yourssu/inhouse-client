import { useAuth } from '@yourssu-inhouse/auth';
import { type ReactNode, useCallback, useState } from 'react';

import { config } from '@/config';

import { useGoogleOAuthPopup } from './useGoogleOAuthPopup';

interface LoginRenderProps {
  isLoading: boolean;
  login: () => Promise<void>;
}

interface LoginProps {
  /**
   * 로그인 상태와 동작을 화면에 전달해요.
   */
  children: (props: LoginRenderProps) => ReactNode;
  onError?: (error: unknown) => void;
  onSuccess?: () => Promise<void> | void;
}

const POPUP_WIDTH = 580;
const POPUP_HEIGHT = 720;

export const Login = ({ onSuccess, onError, children }: LoginProps) => {
  const { login: loginWithCode } = useAuth();
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
  }, [loginWithCode, onSuccess, onError, open]);

  return <>{children({ isLoading, login })}</>;
};
