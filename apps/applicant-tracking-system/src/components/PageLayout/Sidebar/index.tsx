import { Suspense } from 'react';
import { IoMdMoon } from 'react-icons/io';
import { MdPerson, MdPersonSearch, MdSunny } from 'react-icons/md';

import type { RoutePath } from '@/types/route';

import { IconButton } from '@/components/_ui/IconButton';
import { ProfileButton } from '@/components/PageLayout/Sidebar/ProfileButton';
import { SidebarLinkButton } from '@/components/PageLayout/Sidebar/SidebarLinkButton';
import { type ThemeType, useTheme } from '@yourssu-inhouse/interior';

export const Sidebar = () => {
  const { theme, toggle } = useTheme();

  return (
    <div className="bg-sidebarBackground sticky top-0 h-full">
      <div className="flex h-full w-18 flex-col items-center justify-between px-0.5 pt-4 pb-5">
        <div className="flex w-full flex-col items-center gap-4">
          {menuContent.map((item) => (
            <SidebarLinkButton key={item.to} label={item.label} to={item.to}>
              {item.icon}
            </SidebarLinkButton>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <IconButton
            onClick={toggle}
            size="md"
            tooltipContent={themeButtonContent[theme].tooltip}
            tooltipProps={{ side: 'right' }}
          >
            <div className="text-neutralDisabled text-2xl">{themeButtonContent[theme].icon}</div>
          </IconButton>
          <div className="size-8">
            <Suspense>
              <ProfileButton />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

const menuContent = [
  {
    icon: <MdPerson />,
    label: '멤버',
    to: '/members',
  },
  {
    icon: <MdPersonSearch />,
    label: '리쿠르팅',
    to: '/recruit',
  },
] as const satisfies Array<{
  icon: React.ReactNode;
  label: string;
  to: RoutePath;
}>;

const themeButtonContent = {
  light: {
    tooltip: '라이트모드',
    icon: <MdSunny />,
  },
  dark: {
    tooltip: '다크모드',
    icon: <IoMdMoon />,
  },
} as const satisfies Record<ThemeType, { icon: React.ReactNode; tooltip: string }>;
