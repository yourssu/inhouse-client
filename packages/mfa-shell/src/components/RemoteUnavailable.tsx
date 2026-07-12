import { type ReactNode } from 'react';

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
