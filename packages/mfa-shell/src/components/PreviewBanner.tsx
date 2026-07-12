import { type ReactNode } from 'react';

export const PreviewBanner = (): ReactNode => (
  <div
    role="status"
    style={{
      backgroundColor: 'rgba(0,0,0,0.04)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      fontSize: 12,
      padding: '4px 12px',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
    }}
  >
    remote preview — shell 없이 띄운 미리보기. 인증·크롬은 shell(apps/shell) 에서만 동작해요.
  </div>
);

export const PreviewAuthNotice = (): ReactNode => (
  <div
    role="alert"
    style={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      height: '100%',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}
  >
    <strong>인증이 필요한 화면이에요</strong>
    <span>이것은 remote preview 입니다. shell(apps/shell) 에서 로그인한 뒤 다시 보거나,</span>
    <span>인증 가드가 필요 없는 라우트로 이동해 미리보기를 확인하세요.</span>
  </div>
);
