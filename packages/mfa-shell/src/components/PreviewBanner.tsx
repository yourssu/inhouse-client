import { type ReactNode } from 'react';

/*
  remote dev preview harness 가 "독립 앱" 이 아니라 shell 없이 띄운 remote 미리보기임을
  명시하는 배너예요. standalone 이라는 이름이 주던 "인증까지 되는 독립 제품" 착시를 없애요.
  preview 는 shell 크롬/인증 없이 remote 서브트리만 보여주는 개발 도구예요.
*/
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

/*
  preview 에서 인증 가드가 /signin 으로 리다이렉트했지만 remote 에는 signin route 가 없을 때
  보여주는 안내예요. "독립 앱인 척" 하지 않고 preview 한계를 솔직히 알려요.
*/
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
