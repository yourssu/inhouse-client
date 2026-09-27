import type { PropsWithChildren } from 'react';

import { Link, type LinkComponentProps } from '@tanstack/react-router';
import clsx from 'clsx';

export interface SidebarLinkButtonProps extends LinkComponentProps {
  label: string;
}

export const SidebarLinkButton = ({
  label,
  children,
  onClick,
  ...props
}: PropsWithChildren<SidebarLinkButtonProps>) => {
  // 접기 상태는 접기 버튼으로만 토글해요. 링크 클릭(멤버↔리쿠르팅 이동 등)으로
  // 자동 펼침하지 않아 접어둔 상태가 서비스 이동에도 유지돼요.
  return (
    <Link className="group w-full rounded-lg pt-1" onClick={onClick} {...props}>
      {({ isActive }) => {
        return (
          <div
            className={clsx(
              'flex flex-col items-center gap-1.5 transition-[color_0.2s_ease]',
              isActive ? 'text-neutral' : 'text-neutralDisabled',
            )}
          >
            <div
              className={clsx(
                'group-hover:bg-grey200 flex h-10.5 w-10.5 items-center justify-center rounded-lg text-2xl transition-[background-color_0.2s_ease]',
                isActive && 'bg-grey200',
              )}
            >
              {children}
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </div>
        );
      }}
    </Link>
  );
};
