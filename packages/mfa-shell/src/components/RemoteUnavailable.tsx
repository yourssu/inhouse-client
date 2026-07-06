import { type ReactNode } from 'react';

/*
  remote plugin 을 불러오지 못했을 때 shell 이 노출하는 unavailable UI예요. composePlugins 가
  per-plugin 격리로 failures 에 담은 plugin 들에 대해 shell 이 렌더해요. 한 remote 가 죽어도
  나머지 shell 은 동작한다는 걸 사용자에게 알려요.
*/
interface RemoteUnavailableProps {
  /** 사용 가능한(성공적으로 로드된) plugin 이름들. */
  availablePlugins?: readonly string[];
  /** 로드에 실패한 plugin 이름들. */
  failedPlugins: readonly string[];
}

export const RemoteUnavailable = ({
  availablePlugins,
  failedPlugins,
}: RemoteUnavailableProps): ReactNode => {
  return (
    <div
      role="alert"
      style={{
        alignItems: 'center',
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        left: '50%',
        padding: '10px 14px',
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
    >
      <strong>일부 화면을 불러오지 못했어요</strong>
      <span>{failedPlugins.join(', ')} 원격을 로드하지 못했어요.</span>
      {availablePlugins && availablePlugins.length > 0 ? (
        <span>정상 로드: {availablePlugins.join(', ')}</span>
      ) : null}
    </div>
  );
};
